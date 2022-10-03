import { Input, Physics, Display } from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { getLinePoints, getRandomColor } from '../utils/drawing';
import { NUM_BRUSHES, NUM_PAW_PIECES, NUM_TRACKS } from '../constants';

const Color = Display.Color;

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
  private palette: Phaser.Physics.Arcade.Sprite;
  private splat: Phaser.Physics.Arcade.Sprite;
  private splatGlow: Phaser.Physics.Arcade.Sprite;
  private easel: Phaser.Physics.Arcade.Sprite;
  private water: Phaser.Physics.Arcade.Sprite;
  private waterGlow: Phaser.Physics.Arcade.Sprite;
  private smallBrush: Phaser.Physics.Arcade.Sprite;
  private smallBrushGlow: Phaser.Physics.Arcade.Sprite;
  private largeBrush: Phaser.Physics.Arcade.Sprite;
  private largeBrushGlow: Phaser.Physics.Arcade.Sprite;
  private easelGroup: Phaser.Physics.Arcade.Group;

  private frameIt: Phaser.Physics.Arcade.Sprite;
  private drawMode: Phaser.Physics.Arcade.Sprite;
  private download: Phaser.Physics.Arcade.Sprite;
  private credits: Phaser.Physics.Arcade.Sprite;

  private frameItGlow: Phaser.Physics.Arcade.Sprite;
  private drawModeGlow: Phaser.Physics.Arcade.Sprite;
  private downloadGlow: Phaser.Physics.Arcade.Sprite;
  private creditsGlow: Phaser.Physics.Arcade.Sprite;

  private creditsText: Phaser.Physics.Arcade.Sprite;
  private fade: Phaser.Physics.Arcade.Sprite;

  private rt: Phaser.GameObjects.RenderTexture;
  private timer: Phaser.Time.TimerEvent;
  private lastPointerPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private brushScale = 1;
  private drawing = false;
  private colors_used = 0;
  private brush_color = 0;
  private palette_color = getRandomColor();
  private palatte_list = [this.palette_color];
  private water_color = 0xddeeff;
  private selectedBrush = 9;
  private leftUI: Phaser.GameObjects.Image;
  private buttons: Phaser.Physics.Arcade.Sprite[] = [];
  private dirty = false;
  private opacity = 1;
  private music_tracks: Phaser.Sound.BaseSound[] = [];
  private musicButtons: Phaser.Physics.Arcade.Sprite[] = [];
  private selectedMusic = 0;
  private pawPieces: Phaser.Physics.Arcade.Sprite[] = [];
  timer60: Phaser.Time.TimerEvent;
  private started = false;
  fullscreenButton: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  constructor() {
    super(sceneConfig);
  }

  public create(): void {
    this.speed = 200;
    this.brushScale = 1;
    this.drawing = false;
    this.colors_used = 0;
    this.brush_color = 0;
    this.palette_color = getRandomColor();
    this.palatte_list = [this.palette_color];
    this.water_color = 0xddeeff;
    this.buttons = [];
    this.dirty = false;
    this.opacity = 1;
    this.music_tracks = [];
    this.musicButtons = [];
    this.pawPieces = [];

    this.game.sound.stopAll();

    // add looping music to the scene
    for (let i = 0; i < NUM_TRACKS; i++) {
      this.music_tracks.push(this.sound.add(`track${i}`, { loop: true }));
    }

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

    // setup easel
    this.easelGroup = this.physics.add.group();
    this.easel = this.easelGroup.create(0, 0, 'easel') as Physics.Arcade.Sprite;
    this.water = this.easelGroup.create(0, 0, 'water');
    this.waterGlow = this.easelGroup.create(0, 0, 'waterGlow');
    this.smallBrush = this.easelGroup.create(0, 0, 'smallBrush');
    this.smallBrushGlow = this.easelGroup.create(0, 0, 'smallBrushGlow');
    this.largeBrush = this.easelGroup.create(0, 0, 'largeBrush');
    this.largeBrushGlow = this.easelGroup.create(0, 0, 'largeBrushGlow');
    this.waterGlow.visible = false;
    this.smallBrushGlow.visible = false;
    this.largeBrushGlow.visible = false;
    this.easelGroup.scaleXY(-0.55, -0.55);
    this.easelGroup.setXY(screen_center.x + 120, screen_center.y + 65);
    this.water.setInteractive({ pixelPerfect: true, useHandCursor: true });
    this.water.on('pointermove', () => {
      this.waterGlow.visible = true;
    });
    this.water.on('pointerout', () => {
      this.waterGlow.visible = false;
    });
    this.water.alpha = 0.4;
    this.water.on('pointerdown', () => {
      this.setOpacity(Math.max(this.opacity - 0.1, 0.1));
      this.water.alpha = Math.min(this.water.alpha + 0.02 * this.opacity, 1);
      const water = Color.IntegerToRGB(this.water_color);
      const brush = Color.IntegerToRGB(this.brush_color);
      this.water_color =
        (((water.r * 3 + Math.min(water.r, brush.r) * 2 + brush.r) / 6) << 16) |
        (((water.g * 3 + Math.min(water.g, brush.g) * 2 + brush.g) / 6) << 8) |
        ((water.b * 3 + Math.min(water.b, brush.b) * 2 + brush.b) / 6);
      this.water.setTint(this.water_color);
    });
    this.smallBrush.setInteractive({ pixelPerfect: true, useHandCursor: true });
    this.smallBrush.on('pointermove', () => {
      this.smallBrushGlow.visible = true;
    });
    this.smallBrush.on('pointerout', () => {
      this.smallBrushGlow.visible = false;
    });
    this.smallBrush.on('pointerdown', () => {
      this.brushScale = Math.max(this.brushScale - 0.1, 0.1);
      this.image.scale = this.brushScale;
    });
    this.largeBrush.setInteractive({ pixelPerfect: true, useHandCursor: true });
    this.largeBrush.on('pointermove', () => {
      this.largeBrushGlow.visible = true;
    });
    this.largeBrush.on('pointerout', () => {
      this.largeBrushGlow.visible = false;
    });
    this.largeBrush.on('pointerdown', () => {
      this.brushScale = Math.min(this.brushScale + 0.1, 10);
      this.image.scale = this.brushScale;
    });

    this.rt = this.add.renderTexture(screen_center.x, screen_center.y, 600, 400).setOrigin(0.5, 0.5);
    // set render texture color to white
    this.rt.fill(0xffffff);

    // create palette
    this.palette = this.physics.add
      .sprite(screen_center.x - 550, screen_center.y + 250, 'palette')
      .setScale(0.16, 0.16)
      .setRotation(3.3);
    this.splat = this.physics.add.sprite(screen_center.x - 480, screen_center.y + 200, 'splat').setOrigin(0.5, 0.5);
    this.splatGlow = this.physics.add
      .sprite(screen_center.x - 480, screen_center.y + 200, 'splatGlow')
      .setOrigin(0.5, 0.5);
    this.splatGlow.visible = false;
    this.splatGlow.scale = 0.3;
    this.splat.scale = 0.3;
    this.splat.on('pointermove', () => {
      this.splatGlow.visible = true;
    });
    this.splat.on('pointerout', () => {
      this.splatGlow.visible = false;
    });
    this.splat.on('pointerdown', () => {
      this.brush_color = this.palette_color;
      this.image.setTint(this.palette_color);
      this.buttons[this.selectedBrush].setTint(this.palette_color);
      this.setOpacity(1);
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
    this.splat.setInteractive({ pixelPerfect: true, useHandCursor: true });
    this.splat.setTint(this.palette_color);

    // Add a virtual brush, moves with mouse
    this.image = this.physics.add.sprite(screen_center.x, screen_center.y, `brush${this.selectedBrush}`);
    // set image color to black
    this.image.setTint(0x000000);
    this.image.visible = false; // not visible until we can draw

    this.image.scale = this.brushScale;

    this.timer = this.time.addEvent({
      delay: 10,
      callback: () => {
        if (this.dirty) {
          this.setOpacity(this.opacity - 0.001);
          this.dirty = false;
        }
      },
      loop: true,
    });

    this.input.on('pointermove', (pointer: Input.Pointer) => {
      // convert pointer position to render texture position, accounting for the render texture origin
      const pointerPosition = new Phaser.Math.Vector2(pointer.x, pointer.y).subtract(
        new Phaser.Math.Vector2(
          this.rt.x - this.rt.width * this.rt.originX,
          this.rt.y - this.rt.height * this.rt.originY,
        ),
      );

      if (pointer.isDown && this.drawing) {
        this.dirty = true;
        // draw a line from the last pointer position to the current pointer position fill in gaps dynamically
        getLinePoints(this.lastPointerPosition, pointerPosition, (this.image.width * this.brushScale) / 4).forEach(
          (point) => {
            this.rt.draw(this.image, point.x, point.y);
          },
        );
      }
      this.lastPointerPosition.copy(pointerPosition);
    });

    this.fullscreenButton = this.physics.add.sprite(
      getGameWidth(this) - 64,
      getGameHeight(this) - 64,
      'fullscreen-btn',
    );
    this.fullscreenButton.setOrigin(0.5, 0.5);
    this.fullscreenButton.scale = 0.25;
    this.fullscreenButton.setInteractive({});
    this.fullscreenButton.on('pointerup', () => {
      this.game.scale.toggleFullscreen();
    });

    this.leftUI = this.add.image(32, screen_center.y, 'brush1'); // this brush 1 texture is carrying me
    this.leftUI.displayWidth = 64;
    this.leftUI.displayHeight = getGameHeight(this);
    this.leftUI.setTint(0x000000);
    this.leftUI.visible = false; // not visible until we can draw

    // get max resolution for brushes icons to fit on screen vertically with some padding
    const icon_size = getGameHeight(this) / (NUM_BRUSHES + 3);

    // get max padding between icons
    const icon_padding = (getGameHeight(this) - icon_size * (NUM_BRUSHES + 1)) / (NUM_BRUSHES + 1);

    // @TODO - handle unlockables, perhaps just limit num brushes for sequential unlocks
    // or have a list of unlocked brushes ignore rest (use a seperate counter for how many drawn?)
    for (let i = 0; i < NUM_BRUSHES; i++) {
      // equally space white sprites on the leftUI with 12 px padding
      this.buttons.push(this.physics.add.sprite(icon_size, icon_size + i * icon_size + i * icon_padding, `brush${i}`));
      this.buttons[i].setOrigin(0.5, 0.5);
      this.buttons[i].scale = icon_size / 64;
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

    // add three music icons at the top right of the screen alligned vertically
    this.musicButtons = [];
    for (let i = 0; i < NUM_TRACKS; i++) {
      const musicIconSize = icon_size * 2;
      this.musicButtons.push(
        this.physics.add.sprite(
          getGameWidth(this) - musicIconSize,
          musicIconSize + i * musicIconSize + i * icon_padding,
          'musicIcon',
        ),
      );
      this.musicButtons[i].setOrigin(0.5, 0.5);
      this.musicButtons[i].scale = musicIconSize / 256;
      this.musicButtons[i].setTint(0xffffff);
      this.musicButtons[i].setInteractive({ useHandCursor: true });
      this.musicButtons[i].on('pointerdown', (pointer: Input.Pointer) => {
        if (pointer.isDown) {
          console.log('music changed to: ' + i);
          this.musicButtons[this.selectedMusic].setTint(0xffffff);
          this.changeMusic(i);
        }
      });
    }
    this.changeMusic(this.selectedMusic);

    //create buttons
    this.drawMode = this.physics.add
      .sprite(screen_center.x, screen_center.y + 350, 'drawMore')
      .setOrigin(0.5, 0.5)
      .setScale(0.25, 0.25);
    this.drawModeGlow = this.physics.add
      .sprite(screen_center.x, screen_center.y + 350, 'drawMoreGlow')
      .setOrigin(0.5, 0.5)
      .setScale(0.25, 0.25);
    this.drawMode.visible = false;
    this.drawModeGlow.visible = false;
    this.drawMode.on('pointermove', () => {
      this.drawModeGlow.visible = true;
    });
    this.drawMode.on('pointerout', () => {
      this.drawModeGlow.visible = false;
    });
    this.drawMode.on('pointerdown', () => {
      this.scene.restart();
    });
    this.drawMode.setInteractive({ pixelPerfect: true, useHandCursor: true });

    this.download = this.physics.add.sprite(screen_center.x, screen_center.y - 350, 'download').setScale(0.25, 0.25);
    this.downloadGlow = this.physics.add
      .sprite(screen_center.x, screen_center.y - 350, 'downloadGlow')
      .setScale(0.25, 0.25);
    this.download.visible = false;
    this.downloadGlow.visible = false;
    this.download.on('pointermove', () => {
      this.downloadGlow.visible = true;
    });
    this.download.on('pointerout', () => {
      this.downloadGlow.visible = false;
    });
    this.download.on('pointerdown', () => {
      const a = document.createElement('a');
      this.rt.snapshot((e: HTMLImageElement) => {
        a.href = e.src;
        a.download = 'masterpiece.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    });
    this.download.setInteractive({ pixelPerfect: true, useHandCursor: true });
    this.download.visible = false;

    // add paw pieces
    for (let i = 0; i < NUM_PAW_PIECES; i++) {
      const pawPieceSize = icon_size;
      this.pawPieces.push(this.physics.add.sprite(screen_center.x + 220, screen_center.y + 160, `paw${i}`));
      this.pawPieces[i].setOrigin(0.5, 0.5);
      this.pawPieces[i].scale = pawPieceSize / 512;
      this.pawPieces[i].setTint(0xffffff);
    }
    this.togglePaw(false);

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
        this.dirty = true;
      }
    });

    // this.drawMode = this.physics.add
    //   .sprite(screen_center.x, screen_center.y + 350, 'drawMore')
    //   .setOrigin(0.5, 0.5)
    //   .setScale(0.25, 0.25);
    // this.drawModeGlow = this.physics.add
    //   .sprite(screen_center.x, screen_center.y + 350, 'drawMoreGlow')
    //   .setOrigin(0.5, 0.5)
    //   .setScale(0.25, 0.25);
    // //this.drawMode.visible = false;
    // this.drawModeGlow.visible = false;
    // this.drawMode.on('pointermove', () => {
    //   this.drawModeGlow.visible = true;
    // });
    // this.drawMode.on('pointerout', () => {
    //   this.drawModeGlow.visible = false;
    // });
    // this.drawMode.on('pointerdown', () => {
    //   this.scene.restart();
    // });
    // this.drawMode.setInteractive({ pixelPerfect: true, useHandCursor: true });

    // // if we click, draw a dot
    // this.input.on('pointerdown', (pointer: Input.Pointer) => {
    //   const pointerPosition = new Phaser.Math.Vector2(pointer.x, pointer.y).subtract(
    //     new Phaser.Math.Vector2(
    //       this.rt.x - this.rt.width * this.rt.originX,
    //       this.rt.y - this.rt.height * this.rt.originY,
    //     ),
    //   );
    //   if (pointer.isDown && this.drawing) {
    //     this.rt.draw(this.image, pointerPosition.x, pointerPosition.y);
    //     this.dirty = true;
    //   }
    // });

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
        this.setOpacity(Math.max(this.opacity - 0.05, 0.1));
      } else if (event.key === '=') {
        this.setOpacity(Math.min(this.opacity + 0.05, 1));
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

    this.started = true;
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
        if (this.colors_used < 5) {
          this.colors_used++;
          const new_color = getRandomColor();
          this.palette_color = new_color;
          this.palatte_list.push(new_color);
          this.splat.setTint(this.palette_color);
        } else {
          this.togglePaw(true);
          this.splat.visible = false;
          this.timer = this.time.addEvent({
            delay: 2000,
            callback: () => {
              this.drawMode.visible = true;
              this.download.visible = true;
              this.drawing = false;
            },
            loop: true,
          });
        }
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

  private changeMusic(i: number) {
    this.music_tracks[this.selectedMusic].stop();
    if (i < 0) {
      i = NUM_TRACKS + i;
    }
    this.selectedMusic = i % NUM_TRACKS;
    this.music_tracks[this.selectedMusic].play();
    // get color calculated based on index and number of tracks
    const color = Color.HSVToRGB(i / NUM_TRACKS, 1, 1) as Phaser.Types.Display.ColorObject;
    // convert rgb to number
    const colorInt = (color.r << 16) | (color.g << 8) | color.b;

    // rgb to integer
    this.musicButtons[this.selectedMusic].setTint(colorInt);
  }

  private setOpacity(opacity: number) {
    this.opacity = opacity;
    this.image.alpha = Math.pow(opacity, 8);
  }

  private togglePaw(active) {
    this.pawPieces.forEach((pawPiece, index) => {
      if (active) {
        pawPiece.setTint(this.palatte_list[index]);
      }
      pawPiece.setVisible(active);
    });
  }
}
