const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    './**/**/*.html',
    './**/**/*.svelte',
    {
      raw: '<div class="font-medium absolute bg-white -mt-4 rounded-sm elevation-4 z-10 overflow-y-auto hidden p-3 cursor-pointer hover:bg-gray-200 bg-gray-300 text-black border-black bg-transparent focus:outline-none uppercase tracking-wide ripple border border-solid hover:elevation-1 elevation-2 hover:elevation-4 active:elevation-0 rounded-full flex items-center justify-center rounded block w-full h-5 text-xs px-2 h-6 text-sm px-3 h-10 text-lg px-5 h-12 text-xl px-6 h-8 w-8 text-base px-4 cursor-not-allowed hover:rounded-full hover:bg-gray-300 material-icons fixed top-0 bottom-0 left-0 right-0 z-40 h-full bg-black opacity-50 border-blue-700 text-blue-700 text-gray-600 font-light relative border-gray-500 pointer-events-none pb-3 pr-2 md-18 border-2 hover:border-gray-900 ml-2 appearance-none  border-none mt-5 mr-2 text-gray-800 rounded-t border-b  hover:bg-gray-100 border-b-2 pt-6 z-30 elevation-8  bg-blue-500 h-1 mdc-slider__track-container mdc-slider__track move w-1/2 text-blue-500 bg-blue-200 fill-current hover:opacity-25 opacity-0 text-purple-500 stroke-current path"></div>',
      extension: 'html'
    },
  ],

  whitelistPatterns: [/svelte-/],

  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
});

const production = !process.env.ROLLUP_WATCH

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    ...(production ? [purgecss] : [])
  ]
};
