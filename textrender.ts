enum TextAlignment {
    Left,
    Center,
    Right    
}

class TextRender {
    private _text: string;
    private _color: number;
    private _outlineColor?: number;
    private _font: image.Font;
    private _dirty: boolean;
    private _lastRender: Image;

    constructor(
        text: string,
        color: number = 1,
        outlineColor?: number,
        font?: image.Font
    ) {
        this._text = text;
        this._color = color;
        this._outlineColor = outlineColor;
        if (!font)
            this._font = image.font8;
        else
            this._font = font;

        this._dirty = true;
    }

    public setText(text: string): void {
        this._text = text;
        this._dirty = true;
    }

    public text(): string {
        return this._text;
    }

    public setColor(color: number): void {
        this._color = color;
        this._dirty = true;
    }

    public color(): number {
        return this._color;
    }

    public setOutlineColor(color?: number): void {
        this._outlineColor = color;
        this._dirty = true;
    }

    public outlineColor(): number {
        return this._outlineColor;
    }

    public setFont(font: image.Font): void {
        this._font = font;
        this._dirty = true;
    }

    public font(): image.Font {
        return this._font;
    }

    public width(): number {
        if (this._dirty)
            this.render();

        return this._lastRender.width;
    }

    public height(): number {
        if (this._dirty)
            this.render();

        return this._lastRender.height;
    }

    public draw(targetImg: Image, x: number, y: number, alignment: TextAlignment = TextAlignment.Left): void {
        if (this._dirty)
            this.render();

        switch(alignment) {
            case TextAlignment.Center:
                targetImg.drawTransparentImage(this._lastRender, x - Math.idiv(this._lastRender.width, 2), y);
                break;

            case TextAlignment.Right:
                targetImg.drawTransparentImage(this._lastRender, x - this._lastRender.width, y);
                break;

            default:
                targetImg.drawTransparentImage(this._lastRender, x, y);
                break;
        }
    }

    private render(): void {
        const width = this._font.charWidth * this._text.length;
        const height = this._font.charHeight;

        let textImg = image.create(width, height);
        textImg.print(this._text, 0, 0, this._color, this._font,);
        if (this._outlineColor)
            textImg = this.outline(textImg);

        this._lastRender = textImg;
        this._dirty = false;
    }

    private outline(sourceImg: Image): Image {
        const thickness = this._font.multiplier ? Math.round(this._font.multiplier) : 1;
        const doubleThickness = thickness << 1;
        const resultImg = image.create(sourceImg.width + doubleThickness, sourceImg.height);

        const hl = 0;
        const hc = thickness;
        const hr = doubleThickness;

        resultImg.drawImage(sourceImg, hl, 0);
        resultImg.drawTransparentImage(sourceImg, hr, 0);
        resultImg.drawTransparentImage(sourceImg, hl, -thickness);
        resultImg.drawTransparentImage(sourceImg, hr, -thickness);
        resultImg.drawTransparentImage(sourceImg, hl, thickness);
        resultImg.drawTransparentImage(sourceImg, hr, thickness);
        resultImg.drawTransparentImage(sourceImg, hc, -thickness);
        resultImg.drawTransparentImage(sourceImg, hc, thickness);

        resultImg.replace(this._color, this._outlineColor);
        resultImg.drawTransparentImage(sourceImg, hc, 0);

        return resultImg;
    }
}
