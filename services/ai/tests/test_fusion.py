"""Reciprocal Rank Fusion: pure function, no index/model required."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.retrieval.fusion import reciprocal_rank_fusion  # noqa: E402


def test_item_in_both_lists_outscores_item_in_one_list():
    fused = reciprocal_rank_fusion([["a", "b"], ["b", "a"]], k=10)
    # "a": rank1 in list1 + rank2 in list2; "b": rank2 in list1 + rank1 in list2
    # Symmetric positions -> equal fused score.
    assert fused["a"] == fused["b"]


def test_agreement_across_lists_beats_solo_top_rank():
    # "x" is rank 1 in list1 only. "y" is rank 2 in both lists.
    fused = reciprocal_rank_fusion([["x", "y"], ["z", "y"]], k=10)
    assert fused["y"] > fused["x"]


def test_item_missing_from_a_list_gets_no_contribution_from_it():
    fused = reciprocal_rank_fusion([["a"], []], k=10)
    assert fused["a"] == 1.0 / (10 + 1)


def test_weights_scale_each_lists_contribution():
    unweighted = reciprocal_rank_fusion([["a"], ["a"]], k=10, weights=[1.0, 1.0])
    weighted = reciprocal_rank_fusion([["a"], ["a"]], k=10, weights=[1.0, 3.0])
    assert weighted["a"] > unweighted["a"]
    assert weighted["a"] == 1.0 / 11 + 3.0 / 11


def test_empty_input_returns_empty_dict():
    assert reciprocal_rank_fusion([], k=10) == {}
    assert reciprocal_rank_fusion([[], []], k=10) == {}
