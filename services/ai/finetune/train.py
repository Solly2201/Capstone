#!/usr/bin/env python3
"""Fine-tune the production dense embedding model on this project's legal
retrieval triplets (see build_dataset.py). Never trains from scratch --
always starts from the base checkpoint (default: the current production
model, sentence-transformers/all-MiniLM-L6-v2) and continues training it.

Uses sentence-transformers' legacy .fit() API (InputExample + DataLoader)
rather than the newer SentenceTransformerTrainer, since the latter requires
the `datasets` and `accelerate` packages, which aren't part of this
project's existing dependencies (requirements-full.txt) -- .fit() only
needs sentence-transformers + torch, both already installed, per the
instruction to reuse existing infrastructure/dependencies where possible.

Loss: MultipleNegativesRankingLoss (standard Sentence-Transformers
objective for query -> passage retrieval fine-tuning). Each training
example is an (anchor, positive, hard_negative) triplet from
build_dataset.py; the loss also uses every other example's positive/
negative in the batch as additional in-batch negatives, which is the
standard, well-documented behavior for this loss.

The embedded chunk text always matches production's index_build.py
exactly ("{title}. {text}") so the fine-tuned model is trained on the same
text representation it will be evaluated and deployed against -- never a
different format that would make the fine-tune's own eval numbers
meaningless.

Output: services/ai/finetune/output/<run_name>/model/ (gitignored -- see
.gitignore). Never touches the production index or the base checkpoint
cache.
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
import time

os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_ADVISORY_WARNINGS", "1")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")

DEFAULT_BASE_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def _index_text(title: str, text: str) -> str:
    """Must match app/ingestion/index_build.py's _index_text exactly --
    that's what the model will actually be searched against in production."""
    return f"{title}. {text}" if title else text


def load_triplets_as_texts(split: str) -> list[tuple[str, str, str]]:
    from app.retrieval.search import get_section
    from app.retrieval.query_expand import expand_query

    path = os.path.join(DATA_DIR, f"{split}.jsonl")
    triplets = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            row = json.loads(line)
            pos = get_section(*row["positive"].split(":", 1))
            neg = get_section(*row["negative"].split(":", 1))
            if pos is None or neg is None:
                continue  # defensive; build_dataset.py only emits real chunk_ids
            anchor = expand_query(row["query"])
            pos_text = _index_text(pos["title"], pos["text"])
            neg_text = _index_text(neg["title"], neg["text"])
            triplets.append((anchor, pos_text, neg_text))
    return triplets


def set_seed(seed: int) -> None:
    import numpy as np
    import torch

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-model", default=DEFAULT_BASE_MODEL)
    parser.add_argument("--run-name", default="run1")
    parser.add_argument("--epochs", type=int, default=4)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=2e-5)
    parser.add_argument("--warmup-ratio", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--eval-steps", type=int, default=50)
    args = parser.parse_args()

    set_seed(args.seed)

    from sentence_transformers import InputExample, SentenceTransformer, losses
    from sentence_transformers.evaluation import TripletEvaluator
    from torch.utils.data import DataLoader

    print(f"Loading base model: {args.base_model}")
    model = SentenceTransformer(args.base_model)

    train_triplets = load_triplets_as_texts("train")
    val_triplets = load_triplets_as_texts("val")
    print(f"train triplets: {len(train_triplets)}, val triplets: {len(val_triplets)}")

    train_examples = [InputExample(texts=[a, p, n]) for a, p, n in train_triplets]
    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=args.batch_size)
    train_loss = losses.MultipleNegativesRankingLoss(model)

    val_evaluator = TripletEvaluator(
        anchors=[a for a, _, _ in val_triplets],
        positives=[p for _, p, _ in val_triplets],
        negatives=[n for _, _, n in val_triplets],
        name="val",
        batch_size=args.batch_size,
    )

    out_dir = os.path.join(OUTPUT_DIR, args.run_name)
    model_out = os.path.join(out_dir, "model")
    os.makedirs(out_dir, exist_ok=True)

    n_steps_per_epoch = len(train_dataloader)
    warmup_steps = int(n_steps_per_epoch * args.epochs * args.warmup_ratio)

    config = {
        "base_model": args.base_model,
        "run_name": args.run_name,
        "epochs": args.epochs,
        "batch_size": args.batch_size,
        "lr": args.lr,
        "warmup_ratio": args.warmup_ratio,
        "warmup_steps": warmup_steps,
        "seed": args.seed,
        "loss": "MultipleNegativesRankingLoss",
        "n_train_triplets": len(train_triplets),
        "n_val_triplets": len(val_triplets),
    }
    print("Training config:", json.dumps(config, indent=2))

    pre_score = val_evaluator(model, output_path=None)
    print(f"Pre-training val triplet accuracy: {pre_score}")

    start = time.time()
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        evaluator=val_evaluator,
        epochs=args.epochs,
        evaluation_steps=args.eval_steps,
        warmup_steps=warmup_steps,
        optimizer_params={"lr": args.lr},
        output_path=model_out,
        save_best_model=True,
        show_progress_bar=False,
    )
    duration = time.time() - start
    print(f"Training finished in {duration:.1f}s")

    # save_best_model writes the best checkpoint (by val_evaluator) to
    # model_out already; reload it to report the actual saved model's score.
    best_model = SentenceTransformer(model_out)
    post_score = val_evaluator(best_model, output_path=None)
    print(f"Post-training (best checkpoint) val triplet accuracy: {post_score}")

    config["pre_training_val_triplet_accuracy"] = pre_score
    config["post_training_val_triplet_accuracy"] = post_score
    config["train_duration_seconds"] = round(duration, 1)
    with open(os.path.join(out_dir, "train_config.json"), "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print(f"Saved model to {model_out}")
    print(f"Saved config/results to {os.path.join(out_dir, 'train_config.json')}")


if __name__ == "__main__":
    main()
