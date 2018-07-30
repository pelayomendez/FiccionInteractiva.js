
class FIGraphicUtils {
    
    constructor() {

      

    }

    imageToAscii(imageData) {
        
        const [width, height] = this.clampDimensions(imageData.width, imageData.height);

        var canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        let ctx = canvas.getContext("2d")
        ctx.drawImage(imageData, 0, 0, width, height)
        var d = this.convertToGrayScales(ctx,width,height)

        var elem = document.getElementById('screenshoot')
        elem.textContent = ''
        elem.style.cssText = 'position:absolute;font-size:2px;width:'+width+'px;height:'+height+'px;text-align: center;z-index:100;top:50;left:'+((window.innerWidth/2)-(width/2)-75)+';';
        elem.textContent = this.drawAscii(d,width);
        document.body.appendChild(elem)
        document.getElementById('display').style.marginTop = '560px'
        
    }

    drawAscii(grayScales,width) {

 	    const grayRamp =  ' .:-=+*#%@'
        const rampLength = grayRamp.length;

        const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];

        const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
            let nextChars = getCharacterForGrayScale(grayScale);
    
            if ((index + 1) % width === 0) {
                nextChars += '\n';
            }
    
            return asciiImage + nextChars;

        }, '');
    
        return ascii;
    
    };
    
    convertToGrayScales(context, width, height) {
    
        const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;
        const imageData = context.getImageData(0, 0, width, height);
        const grayScales = [];

        for (let i = 0 ; i < imageData.data.length ; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const grayScale = toGrayScale(r, g, b);
            imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;
            grayScales.push(grayScale);
        }

        context.putImageData(imageData, 0, 0);
        return grayScales;

    }

    getFontRatio() {

        const pre = document.createElement('pre');
        pre.style.display = 'inline';
        pre.textContent = ' ';

        document.body.appendChild(pre);
        const { width, height } = pre.getBoundingClientRect();
        document.body.removeChild(pre);

        return height / width;
    
    };

    clampDimensions(width, height) {

        const MAXIMUM_WIDTH = 180;
        const MAXIMUM_HEIGHT = 180;
        const rectifiedWidth = Math.floor(this.getFontRatio() * width);

        if (height > MAXIMUM_HEIGHT) {
            const reducedWidth = Math.floor(rectifiedWidth * MAXIMUM_HEIGHT / height);
            return [reducedWidth, MAXIMUM_HEIGHT];
        }

        if (width > MAXIMUM_WIDTH) {
            const reducedHeight = Math.floor(height * MAXIMUM_WIDTH / rectifiedWidth);
            return [MAXIMUM_WIDTH, reducedHeight];
        }

        return [rectifiedWidth, height];
    }

}

export default new FIGraphicUtils()