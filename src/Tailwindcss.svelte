<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  html,
  body {
    position: relative;
    width: 100%;
  }
  .ripple {
    position: relative;
    overflow: hidden;
    transform: translate3d(0, 0, 0);
  }
  .ripple:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, #000 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: transform 0.5s, opacity 1s;
  }
  .ripple:active:after {
    transform: scale(0, 0);
    opacity: 0.2;
    transition: 0s;
  }
  .material-icons {
    font-family: "Material Icons";
    font-weight: normal;
    font-style: normal;
    font-size: 24px; /* Preferred icon size */
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;

    /* Support for all WebKit browsers. */
    -webkit-font-smoothing: antialiased;
    /* Support for Safari and Chrome. */
    text-rendering: optimizeLegibility;

    /* Support for Firefox. */
    -moz-osx-font-smoothing: grayscale;

    /* Support for IE. */
    font-feature-settings: "liga";
  }
  /* Rules for sizing the icon. */
  .material-icons.md-18 {
    font-size: 18px;
  }
  .material-icons.md-24 {
    font-size: 24px;
  }
  .material-icons.md-36 {
    font-size: 36px;
  }
  .material-icons.md-48 {
    font-size: 48px;
  }

  /* Rules for using icons as black on a light background. */
  .material-icons.md-dark {
    color: rgba(0, 0, 0, 0.54);
  }
  .material-icons.md-dark.md-inactive {
    color: rgba(0, 0, 0, 0.26);
  }

  /* Rules for using icons as white on a dark background. */
  .material-icons.md-light {
    color: rgba(255, 255, 255, 1);
  }
  .material-icons.md-light.md-inactive {
    color: rgba(255, 255, 255, 0.3);
  }
  @font-face {
    font-family: "Material Icons";
    font-style: normal;
    font-weight: 400;
    src: url(./fonts/MaterialIcons-Regular.eot); /* For IE6-8 */
    src: local("Material Icons"), local("MaterialIcons-Regular"),
      url(./fonts/MaterialIcons-Regular.woff2) format("woff2"),
      url(./fonts/MaterialIcons-Regular.woff) format("woff"),
      url(./fonts/MaterialIcons-Regular.ttf) format("truetype");
    font-display: swap;
  }
  /* roboto-100 - latin */
  @font-face {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 100;
    src: url("./fonts/roboto-v20-latin-100.eot"); /* IE9 Compat Modes */
    src: local("Roboto Thin"), local("Roboto-Thin"),
      url("./fonts/roboto-v20-latin-100.eot?#iefix") format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-100.woff2") format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-100.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-100.ttf")
        format("truetype"),
      /* Safari, Android, iOS */ url("./fonts/roboto-v20-latin-100.svg#Roboto")
        format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-100italic - latin */
  @font-face {
    font-family: "Roboto";
    font-style: italic;
    font-weight: 100;
    src: url("./fonts/roboto-v20-latin-100italic.eot"); /* IE9 Compat Modes */
    src: local("Roboto Thin Italic"), local("Roboto-ThinItalic"),
      url("./fonts/roboto-v20-latin-100italic.eot?#iefix")
        format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-100italic.woff2")
        format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-100italic.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-100italic.ttf")
        format("truetype"),
      /* Safari, Android, iOS */
        url("./fonts/roboto-v20-latin-100italic.svg#Roboto") format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-300 - latin */
  @font-face {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 300;
    src: url("./fonts/roboto-v20-latin-300.eot"); /* IE9 Compat Modes */
    src: local("Roboto Light"), local("Roboto-Light"),
      url("./fonts/roboto-v20-latin-300.eot?#iefix") format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-300.woff2") format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-300.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-300.ttf")
        format("truetype"),
      /* Safari, Android, iOS */ url("./fonts/roboto-v20-latin-300.svg#Roboto")
        format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-300italic - latin */
  @font-face {
    font-family: "Roboto";
    font-style: italic;
    font-weight: 300;
    src: url("./fonts/roboto-v20-latin-300italic.eot"); /* IE9 Compat Modes */
    src: local("Roboto Light Italic"), local("Roboto-LightItalic"),
      url("./fonts/roboto-v20-latin-300italic.eot?#iefix")
        format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-300italic.woff2")
        format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-300italic.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-300italic.ttf")
        format("truetype"),
      /* Safari, Android, iOS */
        url("./fonts/roboto-v20-latin-300italic.svg#Roboto") format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-regular - latin */
  @font-face {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 400;
    src: url("./fonts/roboto-v20-latin-regular.eot"); /* IE9 Compat Modes */
    src: local("Roboto"), local("Roboto-Regular"),
      url("./fonts/roboto-v20-latin-regular.eot?#iefix")
        format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-regular.woff2")
        format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-regular.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-regular.ttf")
        format("truetype"),
      /* Safari, Android, iOS */
        url("./fonts/roboto-v20-latin-regular.svg#Roboto") format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-italic - latin */
  @font-face {
    font-family: "Roboto";
    font-style: italic;
    font-weight: 400;
    src: url("./fonts/roboto-v20-latin-italic.eot"); /* IE9 Compat Modes */
    src: local("Roboto Italic"), local("Roboto-Italic"),
      url("./fonts/roboto-v20-latin-italic.eot?#iefix")
        format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-italic.woff2") format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-italic.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-italic.ttf")
        format("truetype"),
      /* Safari, Android, iOS */
        url("./fonts/roboto-v20-latin-italic.svg#Roboto") format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-500 - latin */
  @font-face {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 500;
    src: url("./fonts/roboto-v20-latin-500.eot"); /* IE9 Compat Modes */
    src: local("Roboto Medium"), local("Roboto-Medium"),
      url("./fonts/roboto-v20-latin-500.eot?#iefix") format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-500.woff2") format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-500.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-500.ttf")
        format("truetype"),
      /* Safari, Android, iOS */ url("./fonts/roboto-v20-latin-500.svg#Roboto")
        format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-500italic - latin */
  @font-face {
    font-family: "Roboto";
    font-style: italic;
    font-weight: 500;
    src: url("./fonts/roboto-v20-latin-500italic.eot"); /* IE9 Compat Modes */
    src: local("Roboto Medium Italic"), local("Roboto-MediumItalic"),
      url("./fonts/roboto-v20-latin-500italic.eot?#iefix")
        format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-500italic.woff2")
        format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-500italic.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-500italic.ttf")
        format("truetype"),
      /* Safari, Android, iOS */
        url("./fonts/roboto-v20-latin-500italic.svg#Roboto") format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-700 - latin */
  @font-face {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 700;
    src: url("./fonts/roboto-v20-latin-700.eot"); /* IE9 Compat Modes */
    src: local("Roboto Bold"), local("Roboto-Bold"),
      url("./fonts/roboto-v20-latin-700.eot?#iefix") format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-700.woff2") format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-700.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-700.ttf")
        format("truetype"),
      /* Safari, Android, iOS */ url("./fonts/roboto-v20-latin-700.svg#Roboto")
        format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-700italic - latin */
  @font-face {
    font-family: "Roboto";
    font-style: italic;
    font-weight: 700;
    src: url("./fonts/roboto-v20-latin-700italic.eot"); /* IE9 Compat Modes */
    src: local("Roboto Bold Italic"), local("Roboto-BoldItalic"),
      url("./fonts/roboto-v20-latin-700italic.eot?#iefix")
        format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-700italic.woff2")
        format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-700italic.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-700italic.ttf")
        format("truetype"),
      /* Safari, Android, iOS */
        url("./fonts/roboto-v20-latin-700italic.svg#Roboto") format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-900 - latin */
  @font-face {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 900;
    src: url("./fonts/roboto-v20-latin-900.eot"); /* IE9 Compat Modes */
    src: local("Roboto Black"), local("Roboto-Black"),
      url("./fonts/roboto-v20-latin-900.eot?#iefix") format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-900.woff2") format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-900.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-900.ttf")
        format("truetype"),
      /* Safari, Android, iOS */ url("./fonts/roboto-v20-latin-900.svg#Roboto")
        format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  /* roboto-900italic - latin */
  @font-face {
    font-family: "Roboto";
    font-style: italic;
    font-weight: 900;
    src: url("./fonts/roboto-v20-latin-900italic.eot"); /* IE9 Compat Modes */
    src: local("Roboto Black Italic"), local("Roboto-BlackItalic"),
      url("./fonts/roboto-v20-latin-900italic.eot?#iefix")
        format("embedded-opentype"),
      /* IE6-IE8 */ url("./fonts/roboto-v20-latin-900italic.woff2")
        format("woff2"),
      /* Super Modern Browsers */ url("./fonts/roboto-v20-latin-900italic.woff")
        format("woff"),
      /* Modern Browsers */ url("./fonts/roboto-v20-latin-900italic.ttf")
        format("truetype"),
      /* Safari, Android, iOS */
        url("./fonts/roboto-v20-latin-900italic.svg#Roboto") format("svg"); /* Legacy iOS */
    font-display: swap;
  }
  body {
    margin: 0;
    font-family: Roboto;
  }
</style>
