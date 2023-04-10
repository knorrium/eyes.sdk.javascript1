package com.applitools.eyes;

public class Padding {

    private int top;
    private int right;
    private int bottom;
    private int left;

    public Padding() {
    }

    public Padding(int allDirections) {
        this.top = allDirections;
        this.right = allDirections;
        this.bottom = allDirections;
        this.left = allDirections;
    }

    public Padding(int top, int right, int bottom, int left) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    public Padding clone() {
        Padding clone = new Padding();
        clone.left = this.left;
        clone.top = this.top;
        clone.right = this.right;
        clone.bottom = this.bottom;
        return clone;
    }

    public int getLeft() {
        return left;
    }

    public Padding setLeft(int left) {
        Padding clone = this.clone();
        clone.left = left;

        return clone;
    }

    public int getTop() {
        return top;
    }

    public Padding setTop(int top) {
        Padding clone = this.clone();
        clone.top = top;

        return clone;
    }

    public int getRight() {
        return right;
    }

    public Padding setRight(int right) {
        Padding clone = this.clone();
        clone.right = right;

        return clone;
    }

    public int getBottom() {
        return bottom;
    }

    public Padding setBottom(int bottom) {
        Padding clone = this.clone();
        clone.bottom = bottom;

        return clone;
    }
}
