
/**
 * @see {@link https://drafts.csswg.org/css-color-4/#typedef-deprecated-color}
 */
const mappings = [
    ['ActiveBorder', 'ButtonBorder'],
    ['ActiveCaption', 'CanvasText'],
    ['AppWorkspace', 'Canvas'],
    ['Background', 'Canvas'],
    ['ButtonHighlight', 'ButtonFace'],
    ['ButtonShadow', 'ButtonFace'],
    ['CaptionText', 'CanvasText'],
    ['InactiveBorder', 'ButtonBorder'],
    ['InactiveCaption', 'Canvas'],
    ['InactiveCaptionText', 'GrayText'],
    ['InfoBackground', 'Canvas'],
    ['InfoText', 'CanvasText'],
    ['Menu', 'Canvas'],
    ['MenuText', 'CanvasText'],
    ['Scrollbar', 'Canvas'],
    ['ThreeDDarkShadow', 'ButtonBorder'],
    ['ThreeDFace', 'ButtonFace'],
    ['ThreeDHighlight', 'ButtonBorder'],
    ['ThreeDLightShadow', 'ButtonBorder'],
    ['ThreeDShadow', 'ButtonBorder'],
    ['Window', 'Canvas'],
    ['WindowFrame', 'ButtonBorder'],
    ['WindowText', 'CanvasText'],
]

module.exports = mappings.map(([mapped]) => mapped)
