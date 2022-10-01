import { Input } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { getLinePoints } from '../utils/drawing';

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
  private timer: Phaser.Time.TimerEvent;
  private text: Phaser.GameObjects.Text;
  private lastPointerPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private brushScale = 1;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // create a 10 second timer
    this.timer = this.time.addEvent({
      delay: 10000,
      callback: () => {
        this.image.setTint(Math.random() * 0xffffff);
      },
      loop: true,
    });

    // add text to display the timer
    this.text = this.add.text(400, 300, 'Hello World', {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      color: '#ff000000',
    });

    // This is a nice helper Phaser provides to create listeners for some of the most common keys.
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.rt = this.add.renderTexture(0, 0, 800, 600);
    // set render texture color to white
    this.rt.fill(0xffffff);

    // Add a virtual brush, moves with mouse
    this.image = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'brush');
    // set image color to black
    this.image.setTint(0x000000);

    this.image.scale = this.brushScale;

    this.input.on('pointermove', (pointer: Input.Pointer) => {
      if (pointer.isDown) {
        // draw a line from the last pointer position to the current pointer position fill in gaps dynamically
        getLinePoints(this.lastPointerPosition, pointer.position, (this.image.width * this.brushScale) / 4).forEach(
          (point) => {
            this.rt.draw(this.image, point.x, point.y);
          },
        );
      }
      this.lastPointerPosition.copy(pointer.position);
    });

    // set image scale when using bracket keys
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (event.key === '[') {
        this.brushScale = Math.max(this.brushScale - 0.1, 0.1);
      } else if (event.key === ']') {
        this.brushScale += 0.1;
      }
      this.image.scale = this.brushScale;
    });
  }

  public update(): void {
    // set image position to mouse pointer
    this.image.setPosition(this.input.activePointer.x, this.input.activePointer.y);
    //this.image.setPosition(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
  }
}
