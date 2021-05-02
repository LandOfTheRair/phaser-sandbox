export default class OutlinePipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline
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
      let outlineColor = sprite.pipelineData['outlineColor'];
      if (!outlineColor || outlineColor.length != 4) {
        outlineColor = [0,0,0,0];
      }
      let colorMin = sprite.pipelineData['colorMin'];
      if (!colorMin || colorMin.length != 3) {
        colorMin = [0,0,0];
      }
      let colorMax = sprite.pipelineData['colorMax'];
      if (!colorMax || colorMax.length != 3) {
        colorMax = [1,1,1];
      }
      this.set4fv('uOutlineColor', outlineColor);
      this.set1f('uSwimming', sprite.pipelineData['swimming'] || false);
      this.set1f('uTime', this.game.loop.getDuration());
      this.set3fv('uColorMin', colorMin);
      this.set3fv('uColorMax', colorMax);
      this.set1f('uFillBlack', sprite.pipelineData['fillBlack'] || false);
    }

    // each number is a float between 0 to 1
    public static setOutlineColorRGBA(sprite: Phaser.GameObjects.Sprite, red: number, green:number, blue:number, alpha:number) {
      sprite.setPipelineData('outlineColor', [red, green, blue, alpha]);
    }

    // Color is an array containing [red, green, blue, alpha], each number is a float between 0 to 1
    public static setOutlineColor(sprite: Phaser.GameObjects.Sprite, color: Array<number>) {
      sprite.setPipelineData('outlineColor', color);
    }

    public static setColorMin(sprite: Phaser.GameObjects.Sprite, color: Array<number>) {
      sprite.setPipelineData('colorMin', color);
    }

    public static setColorMax(sprite: Phaser.GameObjects.Sprite, color: Array<number>) {
      sprite.setPipelineData('colorMax', color);
    }

    public static fillBlack(sprite: Phaser.GameObjects.Sprite, enabled: false) {
      sprite.setPipelineData('fillBlack', enabled);
    }

    // Color is an array containing [red, green, blue, alpha], each number is a float between 0 to 1
    public static setSwimming(sprite: Phaser.GameObjects.Sprite, swimming: boolean) {
      sprite.setPipelineData('swimming', swimming);
    }
}

const fragShader = `
precision lowp float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform vec2 uTexturePixelOffset;
uniform vec2 uTextureImageSize;
uniform vec4 uOutlineColor;
uniform vec2 uTextureSpriteSize;
uniform vec3 uColorMin;
uniform vec3 uColorMax;
uniform bool uSwimming;
uniform float uTime;

vec4 restrict( vec4 color) {
  if (color.x > uColorMax.x || color.y > uColorMax.y || color.z > uColorMax.z) {
    return vec4(0.0, 0.0, 0.0, 0.0);
  }
  if (color.x < uColorMin.x || color.y < uColorMin.y || color.z < uColorMin.z) {
    return vec4(0.0, 0.0, 0.0, 0.0);
  }
  return color;
}
void outline( out vec4 fragColor)
{
  vec2 pixelSize = vec2(1.0,1.0)/uTextureImageSize;
  vec2 spritePixelSmooth = (outTexCoord/pixelSize) - uTexturePixelOffset;
  vec2 spritePixel = floor(spritePixelSmooth);
  fragColor = texture2D(uMainSampler, outTexCoord);

  vec4 color = restrict(fragColor);
  bool edgeL = spritePixel.x == 0.0;
  bool edgeR = spritePixel.x == uTextureSpriteSize.x - 1.0;
  bool edgeU = spritePixel.y == 0.0;
  bool edgeD = spritePixel.y == uTextureSpriteSize.y - 1.0;
  if (uOutlineColor.a != 0.0) {
    //If the current pixel is not visible
    if (color.a == 0.0) {
      bool colorU = restrict(texture2D(uMainSampler, outTexCoord - vec2(0, pixelSize.y))).a == 1.0 && !edgeU;
      bool colorD = restrict(texture2D(uMainSampler, outTexCoord + vec2(0, pixelSize.y))).a == 1.0 && !edgeD;
      bool colorL = restrict(texture2D(uMainSampler, outTexCoord - vec2(pixelSize.x, 0))).a == 1.0 && !edgeL;
      bool colorR = restrict(texture2D(uMainSampler, outTexCoord + vec2(pixelSize.x, 0))).a == 1.0 && !edgeR;

      bool colorUL = restrict(texture2D(uMainSampler, outTexCoord - vec2(pixelSize.x, pixelSize.y))).a == 1.0 && !edgeU && !edgeL;
      bool colorUR = restrict(texture2D(uMainSampler, outTexCoord + vec2(pixelSize.x, -pixelSize.y))).a == 1.0 && !edgeU && !edgeR;
      bool colorDL = restrict(texture2D(uMainSampler, outTexCoord + vec2(-pixelSize.x, pixelSize.y))).a == 1.0 && !edgeD && !edgeL;
      bool colorDR = restrict(texture2D(uMainSampler, outTexCoord + vec2(pixelSize.x, pixelSize.y))).a == 1.0 && !edgeD && !edgeR;
      bool ok = (!(colorU && colorD)) && (!(colorL && colorR)) && (!(colorUL && colorDR)) && (!(colorDL && colorUR));
      float live = float(colorU) + float(colorD) + float(colorL) + float(colorR) +
                  float(colorUL) + float(colorUR) + float(colorDL) + float(colorDR);
      if ((live > 2.0) && ok && (colorU || colorD || colorL || colorR))
      {
        fragColor = uOutlineColor;
      }
    } else if (color.a == 1.0 && (edgeL || edgeR || edgeU || edgeD)) {
      fragColor = uOutlineColor;
    }
  }

  if (uSwimming && spritePixelSmooth.y > (cos(uTime*2.5)*2.0)+32.0) {
    fragColor.a = 0.001;
  }
}

void main(void) {
  outline(gl_FragColor);
}`;
