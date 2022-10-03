# Minute Monet
n Minute Monet, your get to create your very own masterpiece in one minute! Every ten seconds, you will get a new random color. With your trusty cat friend, Tink, you’ll get to sign your artwork too! 
* Play it on [itch.io](https://notoriouseng.itch.io/minute-monet)
* Made for [Ludum-dare-51](https://ldjam.com/events/ludum-dare/51/minute-monet)

## Fix `ERR_OSSL_EVP_UNSUPPORTED` for Powershell
```ps
$env:NODE_OPTIONS="--openssl-legacy-provider"
```

## How to Use

You should be able to clone this repository and run `yarn install` to get any of the necessary dependencies. If you don't have Yarn, you can learn how to install it from [here](https://classic.yarnpkg.com/lang/en/docs/install)

Once you're done installing, simply run `yarn dev` and the game should begin to run. You'll have to open an internet browser and go to the port that the game is running on (usually `localhost:8080` by default).

Running `yarn dev` runs the game in development mode, which produces larger bundle sizes but compiles faster and provides better debug support. If you desire a smaller game bundle or to host your game on a server, you can use `yarn build:prod` to compile the project into an optimized bundle. You can use `yarn prod` to run your game locally with production compilation, but this will cause your hot reloading to take longer.

## Extensions

You can edit this code with any text editor. VS Code is recommended, though. If you download the Prettier and ESLint extensions, you can get automatic code formatting to work.

## Further Reading

The [official Phaser documentation](https://phaser.io/learn) has lots of great tutorials, and the [Phaser Labs page](https://labs.phaser.io/) is full of great examples of using any aspect of Phaser.
