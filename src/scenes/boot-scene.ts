import { getGameWidth, getGameHeight } from '../helpers';
import { NUM_BRUSHES } from '../constants';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Boot',
};

/**
 * The initial scene that loads all necessary assets to the game and displays a loading bar.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public preload(): void {
    const halfWidth = getGameWidth(this) * 0.5;
    const halfHeight = getGameHeight(this) * 0.5;

    const progressBarHeight = 100;
    const progressBarWidth = 400;

    const progressBarContainer = this.add.rectangle(
      halfWidth,
      halfHeight,
      progressBarWidth,
      progressBarHeight,
      0x000000,
    );
    const progressBar = this.add.rectangle(
      halfWidth + 20 - progressBarContainer.width * 0.5,
      halfHeight,
      10,
      progressBarHeight - 20,
      0x888888,
    );

    const loadingText = this.add.text(halfWidth - 75, halfHeight - 100, 'Loading...').setFontSize(24);
    const percentText = this.add.text(halfWidth - 25, halfHeight, '0%').setFontSize(24);
    const assetText = this.add.text(halfWidth - 25, halfHeight + 100, '').setFontSize(24);

    this.load.on('progress', (value) => {
      progressBar.width = (progressBarWidth - 30) * value;

      const percent = value * 100;
      percentText.setText(`${percent}%`);
    });

    this.load.on('fileprogress', (file) => {
      assetText.setText(file.key);
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
      progressBar.destroy();
      progressBarContainer.destroy();

      this.scene.start('Draw');
    });

    this.loadAssets();
  }

  /**
   * All assets that need to be loaded by the game (sprites, images, animations, tiles, music, etc)
   * should be added to this method. Once loaded in, the loader will keep track of them, indepedent of which scene
   * is currently active, so they can be accessed anywhere.
   */
  private loadAssets() {
    // Load sample assets

    // Source: Open Game Art
    this.load.image('man', 'assets/sprites/character.png');
    this.load.image('cat', 'assets/sprites/cat-900x900.png');
    this.load.image('bg', 'assets/sprites/background.png');
    this.load.image('splat', 'assets/sprites/splat.png');
    this.load.image('easel', 'assets/sprites/easelPaper.png');
    this.load.image('water', 'assets/sprites/water.png');
    this.load.image('waterGlow', 'assets/sprites/glow.png');
    this.load.image('smallBrush', 'assets/sprites/small_brush.png');
    this.load.image('smallBrushGlow', 'assets/sprites/brush_icon_glow.png');
    this.load.image('largeBrush', 'assets/sprites/large_brush.png');
    this.load.image('largeBrushGlow', 'assets/sprites/brush_glow_large.png');
    this.load.image('palette', 'assets/sprites/palette1.png');
    this.load.image('splatGlow', 'assets/sprites/splat_glow.png');
    this.load.image('musicIcon', 'assets/sprites/music-icon.png');

    this.load.image('frameIt', 'assets/sprites/frameit.png');
    this.load.image('title', 'assets/sprites/title.png');
    this.load.image('drawMore', 'assets/sprites/drawmore.png');
    this.load.image('download', 'assets/sprites/download.png');
    this.load.image('credits', 'assets/sprites/credits.png');

    this.load.image('frameItGlow', 'assets/sprites/frameitGlow.png');
    this.load.image('titleGlow', 'assets/sprites/titleGlow.png');
    this.load.image('drawMoreGlow', 'assets/sprites/drawmoreGlow.png');
    this.load.image('downloadGlow', 'assets/sprites/downloadGlow.png');
    this.load.image('creditsGlow', 'assets/sprites/creditsGlow.png');

    this.load.image('creditsText', 'assets/sprites/credits_list.png');
    this.load.image('fade', 'assets/sprites/fade.png');

    for (let i = 0; i < NUM_BRUSHES; i++) {
      this.load.image(`brush${i}`, `assets/sprites/brushes/${i}.png`);
    }

    // load music
    this.load.audio('track0', 'assets/music/two_left_socks.ogg');
    this.load.audio('track1', 'assets/music/rainy_village_8_bit_lofi.mp3');
    this.load.audio('track2', 'assets/music/SummerChallenge.mp3');
    this.load.audio('track3', 'assets/music/Fingersnap-bar.mp3');
  }
}
