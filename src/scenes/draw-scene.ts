import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Draw',
};

export class DrawScene extends Phaser.Scene {
  public speed = 200;

  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private image: Phaser.Physics.Arcade.Sprite;
  private rt: Phaser.GameObjects.RenderTexture;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // Add a player sprite that can be moved around. Place him in the middle of the screen.
    this.image = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'brush');

    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.rt = this.add.renderTexture(0, 0, 800, 600);

    this.input.on('pointermove', (pointer: Input.Pointer) => {
      if (pointer.isDown) {
        this.rt.draw(this.image, pointer.x, pointer.y);
      }
    });
  }

  public update(): void {
    // set image position to mouse pointer
    this.image.setPosition(this.input.activePointer.x, this.input.activePointer.y);
    //this.image.setPosition(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
  }
}
