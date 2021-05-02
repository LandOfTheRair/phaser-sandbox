export default class FovPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline
{
    constructor(game: Phaser.Types.Renderer.WebGL.WebGLPipelineConfig)
    {
      super({
        game: game as any,
        fragShader
      });
    }

    onBind(gameObject?: Phaser.GameObjects.GameObject): void {
      this.flush();
      const sprite = gameObject as Phaser.GameObjects.Sprite;
      const texture = sprite.texture.getSourceImage();
      this.set2f('uTextureImageSize', texture.width, texture.height);
      this.set2f('uTexturePixelOffset', sprite.frame.cutX, sprite.frame.cutY);
      this.set2f('uTextureSpriteSize', sprite.frame.cutWidth, sprite.frame.cutHeight);
      this.setMatrix3fv('uDirections',false, sprite.pipelineData['dirs']);
    }

    // each number is a float between 0 to 1
    public static setFillDir(sprite: Phaser.GameObjects.Sprite, dirs: any) {
      sprite.setPipelineData('dirs', dirs);
    }
}

const fragShader = `
precision lowp float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform vec2 uTexturePixelOffset;
uniform vec2 uTextureImageSize;
uniform vec2 uTextureSpriteSize;
uniform mat3 uDirections;

void outline( out vec4 fragColor)
{
  vec2 pixelSize = vec2(1.0,1.0)/uTextureImageSize;
  vec2 spritePixelSmooth = (outTexCoord/pixelSize) - uTexturePixelOffset;
  vec2 spritePixel = floor(spritePixelSmooth);
  for
  fragColor = texture2D(uMainSampler, outTexCoord);
}

void main(void) {
  outline(gl_FragColor);
}`;
