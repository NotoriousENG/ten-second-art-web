import { Input, Physics } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { getLinePoints, getRandomColor } from '../utils/drawing';
import { NUM_BRUSHES } from '../constants';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Draw',
};

export class DrawScene extends Phaser.Scene {
  public speed = 200;
  private bg: Phaser.GameObjects.Image;
  private image: Phaser.Physics.Arcade.Sprite;
  private cat: Phaser.Physics.Arcade.Sprite;
  private splat: Phaser.Physics.Arcade.Sprite;
  private easel: Phaser.Physics.Arcade.Sprite;
  private water: Phaser.Physics.Arcade.Sprite;
  private waterGlow: Phaser.Physics.Arcade.Sprite;
  private easelGroup: Phaser.Physics.Arcade.Group;
  private rt: Phaser.GameObjects.RenderTexture;
  private timer: Phaser.Time.TimerEvent;
  private lastPointerPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private brushScale = 1;
  private drawing = false;
  private colors_used = 0;
  private palette_color = getRandomColor();
  private palatte_list = [this.palette_color];
  private water_color = 0;
  private selectedBrush = 0;
  private leftUI: Phaser.GameObjects.Image;
  private buttons: Phaser.Physics.Arcade.Sprite[] = [];

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

    // add debug palatte
    this.splat = this.physics.add.sprite(100, 100, 'splat').setOrigin(0.5, 0.5);
    this.splat.scale = 0.2;
    this.splat.on('pointerdown', () => {
      this.image.setTint(this.palette_color);
      this.buttons[this.selectedBrush].setTint(this.palette_color);
      if (!this.drawing) {
        // make sure ui is visible
        this.image.visible = true;
        this.leftUI.visible = true;
        this.buttons.forEach((button) => {
          button.visible = true;
          // set ui as interactive
          button.setInteractive({ useHandCursor: true });
        });

        this.start_drawing();
      }
    });
    this.splat.setInteractive({ pixelPerfect: true });
    this.splat.setTint(this.palette_color);

    // setup easel
    this.easelGroup = this.physics.add.group();
    this.easel = this.easelGroup.create(0, 0, 'easel') as Physics.Arcade.Sprite;
    this.water = this.easelGroup.create(0, 0, 'water');
    this.waterGlow = this.easelGroup.create(0, 0, 'waterGlow');
    this.easelGroup.scaleXY(-0.55, -0.55);
    this.easelGroup.setXY(screen_center.x + 120, screen_center.y + 65);

    this.rt = this.add.renderTexture(screen_center.x, screen_center.y, 600, 400).setOrigin(0.5, 0.5);
    // set render texture color to white
    this.rt.fill(0xffffff);

    // Add a virtual brush, moves with mouse
    this.image = this.physics.add.sprite(screen_center.x, screen_center.y, `brush${this.selectedBrush}`);
    // set image color to black
    this.image.setTint(0x000000);
    this.image.visible = false; // not visible until we can draw

    this.image.scale = this.brushScale;

    this.input.on('pointermove', (pointer: Input.Pointer) => {
      // convert pointer position to render texture position, accounting for the render texture origin
      const pointerPosition = new Phaser.Math.Vector2(pointer.x, pointer.y).subtract(
        new Phaser.Math.Vector2(
          this.rt.x - this.rt.width * this.rt.originX,
          this.rt.y - this.rt.height * this.rt.originY,
        ),
      );

      if (pointer.isDown && this.drawing) {
        // draw a line from the last pointer position to the current pointer position fill in gaps dynamically
        getLinePoints(this.lastPointerPosition, pointerPosition, (this.image.width * this.brushScale) / 4).forEach(
          (point) => {
            this.rt.draw(this.image, point.x, point.y);
          },
        );
      }
      this.lastPointerPosition.copy(pointerPosition);
    });

    this.leftUI = this.add.image(32, screen_center.y, 'brush1'); // this brush 1 texture is carrying me
    this.leftUI.displayWidth = 64;
    this.leftUI.displayHeight = 1080;
    this.leftUI.setTint(0x000000);
    this.leftUI.visible = false; // not visible until we can draw

    // @TODO - handle unlockables, perhaps just limit num brushes for sequential unlocks
    // or have a list of unlocked brushes ignore rest (use a seperate counter for how many drawn?)
    for (let i = 0; i < NUM_BRUSHES; i++) {
      // equally space white sprites on the leftUI with 12 px padding
      this.buttons.push(this.physics.add.sprite(32, 32 + i * 32 + 12 * i, `brush${i}`));
      this.buttons[i].setOrigin(0.5, 0.5);
      this.buttons[i].scale = 0.5;
      // add an event listener to each button to change the brush
      this.buttons[i].on('pointerdown', (pointer: Input.Pointer) => {
        if (pointer.isDown) {
          console.log('brush changed to: ' + i);
          this.buttons[this.selectedBrush].setTint(0xffffff);
          this.changeBrush(i);
          this.buttons[this.selectedBrush].setTint(this.image.tintTopLeft);
        }
      });
      this.buttons[i].visible = false; // not visible until we can draw
    }

    // if we click, draw a dot
    this.input.on('pointerdown', (pointer: Input.Pointer) => {
      const pointerPosition = new Phaser.Math.Vector2(pointer.x, pointer.y).subtract(
        new Phaser.Math.Vector2(
          this.rt.x - this.rt.width * this.rt.originX,
          this.rt.y - this.rt.height * this.rt.originY,
        ),
      );
      if (pointer.isDown && this.drawing) {
        this.rt.draw(this.image, pointerPosition.x, pointerPosition.y);
      }
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

    // change brush when pressing up or down
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        this.changeBrush(this.selectedBrush + 1);
      } else if (event.key === 'ArrowDown') {
        this.changeBrush(this.selectedBrush - 1);
      }
    });
  }

  public update(): void {
    // set image position to mouse pointer
    this.image.setPosition(this.input.activePointer.x, this.input.activePointer.y);
    //this.image.setPosition(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public save_image(): void {}

  public go_to_cat_stamp(): void {
    this.scene.start('Stamp');
  }

  public start_drawing(): void {
    // create a 10 second timer
    this.timer = this.time.addEvent({
      delay: 10000,
      callback: () => {
        this.colors_used++;
        const new_color = getRandomColor();
        this.palette_color = new_color;
        this.palatte_list.push(new_color);
        this.splat.setTint(this.palette_color);
      },
      loop: true,
    });
    this.drawing = true;
  }

  // ORDER OF EVENTS:
  // ONE: Color is picked
  // TWO: Timer starts when mouse is clicked
  private changeBrush(desiredBrush: number) {
    if (desiredBrush < 0) {
      desiredBrush = NUM_BRUSHES + desiredBrush; // 22 + (-1) = 21
    }
    this.selectedBrush = desiredBrush % NUM_BRUSHES;
    this.image.setTexture(`brush${this.selectedBrush}`);
  }
}
