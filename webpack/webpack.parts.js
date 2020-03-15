const MiniCssExtractPlugin = require('mini-css-extract-plugin')

exports.extractCSS = ({ include, exclude, use = {}}) => {

    const plugin = new MiniCssExtractPlugin({
        filename: '[name].css'
    })

    return {
        module: {
            rules: [
                {
                    test: /\.css$/,
                    include, 
                    exclude,
                    use: [
                        MiniCssExtractPlugin.loader
                    ].concat(use)
                }
            ]
        },
        plugins: [plugin]
    }
}