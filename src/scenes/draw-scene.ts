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
  private bg: Phaser.GameObjects.Image;
  private image: Phaser.Physics.Arcade.Sprite;
  private cat: Phaser.Physics.Arcade.Sprite;
  private rt: Phaser.GameObjects.RenderTexture;
  private timer: Phaser.Time.TimerEvent;
  private text: Phaser.GameObjects.Text;
  private lastPointerPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private brushScale = 1;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    // get the center position of the screen
    const screen_center = new Phaser.Math.Vector2(getGameWidth(this) / 2, getGameHeight(this) / 2);

    // create background
    this.bg = this.add.image(screen_center.x, screen_center.y, 'bg').setOrigin(0.5, 0.5);

    this.bg.displayWidth = this.sys.canvas.width;
    this.bg.displayHeight = this.sys.canvas.height;

    // create cat
    this.cat = this.physics.add.sprite(screen_center.x, getGameHeight(this), 'cat').setOrigin(0.5, 0.5);
    this.cat.scale = 0.2;
    this.cat.setPosition(screen_center.x / 2, getGameHeight(this) - (this.cat.height * this.cat.scaleY) / 2);

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

    this.rt = this.add.renderTexture(screen_center.x, screen_center.y, 600, 400).setOrigin(0.5, 0.5);
    // set render texture color to white
    this.rt.fill(0xffffff);

    // Add a virtual brush, moves with mouse
    this.image = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'brush');
    // set image color to black
    this.image.setTint(0x000000);

    this.image.scale = this.brushScale;

    this.input.on('pointermove', (pointer: Input.Pointer) => {
      // convert pointer position to render texture position, accounting for the render texture origin
      const pointerPosition = new Phaser.Math.Vector2(pointer.x, pointer.y).subtract(
        new Phaser.Math.Vector2(
          this.rt.x - this.rt.width * this.rt.originX,
          this.rt.y - this.rt.height * this.rt.originY,
        ),
      );

      if (pointer.isDown) {
        // draw a line from the last pointer position to the current pointer position fill in gaps dynamically
        getLinePoints(this.lastPointerPosition, pointerPosition, (this.image.width * this.brushScale) / 4).forEach(
          (point) => {
            this.rt.draw(this.image, point.x, point.y);
          },
        );
      }
      this.lastPointerPosition.copy(pointerPosition);
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

    // set opacity of image when using - and = keys
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (event.key === '-') {
        this.image.alpha = Math.max(this.image.alpha - 0.05, 0.1);
      } else if (event.key === '=') {
        this.image.alpha = Math.min(this.image.alpha + 0.05, 1);
      }
    });
  }

  public update(): void {
    // set image position to mouse pointer
    this.image.setPosition(this.input.activePointer.x, this.input.activePointer.y);
    //this.image.setPosition(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
  }
}
