/**
 * PptxGenJS: Slide Class
 */

import { CHART_NAME, SHAPE_NAME } from './core-enums'
import {
	BkgdOpts,
	HexColor,
	IChartMulti,
	IChartOpts,
	IChartOptsLib,
	IImageOpts,
	ILayout,
	ISlideLayout,
	ISlideNumber,
	ISlideObject,
	ISlideRel,
	ISlideRelChart,
	ISlideRelMedia,
	ITableOptions,
	IText,
	ITextOpts,
	MediaOpts,
	ShapeOptions,
	TableRow,
} from './core-interfaces'
import * as genObj from './gen-objects'

export default class Slide {
	private _setSlideNum: Function

	public addSlide: Function
	public data: ISlideObject[]
	public getSlide: Function
	public id: number
	public name: string
	public number: number
	public presLayout: ILayout
	public rels: ISlideRel[]
	public relsChart: ISlideRelChart[]
	public relsMedia: ISlideRelMedia[]
	public rId: number
	public slideLayout: ISlideLayout
	public slideNumberObj: ISlideNumber

	constructor(params: {
		addSlide: Function
		getSlide: Function
		presLayout: ILayout
		setSlideNum: Function
		slideId: number
		slideRId: number
		slideNumber: number
		slideLayout?: ISlideLayout
	}) {
		this.addSlide = params.addSlide
		this.getSlide = params.getSlide
		this.presLayout = params.presLayout
		this._setSlideNum = params.setSlideNum
		this.id = params.slideId
		this.rId = params.slideRId
		this.name = 'Slide ' + params.slideNumber
		this.number = params.slideNumber
		this.data = []
		this.rels = []
		this.relsChart = []
		this.relsMedia = []
		this.slideLayout = params.slideLayout || null
		// NOTE: Slide Numbers: In order for Slide Numbers to function they need to be in all 3 files: master/layout/slide
		// `defineSlideMaster` and `addNewSlide.slideNumber` will add {slideNumber} to `this.masterSlide` and `this.slideLayouts`
		// so, lastly, add to the Slide now.
		this.slideNumberObj = this.slideLayout && this.slideLayout.slideNumberObj ? this.slideLayout.slideNumberObj : null
	}

	/**
	 * Background color
	 * @type {string}
	 * @deprecated in v3.3.0 - use `background` instead
	 */
	private _bkgd: string
	public set bkgd(value: string) {
		this._bkgd = value
	}
	public get bkgd(): string {
		return this._bkgd
	}

	/**
	 * Background color or image
	 * @type {BkgdOpts}
	 * @example solid color `background: {fill:'FF0000'}
	 * @example base64 `background: {data:'image/png;base64,ABC[...]123'}`
	 * @example url  `background: {path:'https://some.url/image.jpg'}`
	 * @since v3.3.0
	 */
	private _background: BkgdOpts
	public set background(value: BkgdOpts) {
		genObj.addBackgroundDefinition(value, this)
	}
	public get background(): BkgdOpts {
		return this._background
	}

	/**
	 * Default font color
	 * @type {HexColor}
	 */
	private _color: HexColor
	public set color(value: HexColor) {
		this._color = value
	}
	public get color(): HexColor {
		return this._color
	}

	/**
	 * @type {boolean}
	 */
	private _hidden: boolean
	public set hidden(value: boolean) {
		this._hidden = value
	}
	public get hidden(): boolean {
		return this._hidden
	}

	/**
	 * @type {ISlideNumber}
	 */
	private _slideNumber: ISlideNumber
	public set slideNumber(value: ISlideNumber) {
		// NOTE: Slide Numbers: In order for Slide Numbers to function they need to be in all 3 files: master/layout/slide
		this.slideNumberObj = value
		this._slideNumber = value
		this._setSlideNum(value)
	}
	public get slideNumber(): ISlideNumber {
		return this._slideNumber
	}

	/**
	 * Add chart to Slide
	 * @param {CHART_NAME|IChartMulti[]} type - chart type
	 * @param {object[]} data - data object
	 * @param {IChartOpts} options - chart options
	 * @return {Slide} this Slide
	 */
	addChart(type: CHART_NAME | IChartMulti[], data: any[], options?: IChartOpts): Slide {
		// FUTURE: TODO-VERSION-4: Remove first arg - only take data and opts, with "type" required on opts
		// Set `_type` on IChartOptsLib as its what is used as object is passed around
		let optionsWithType: IChartOptsLib = options || {}
		optionsWithType._type = type
		genObj.addChartDefinition(this, type, data, options)
		return this
	}

	/**
	 * Add image to Slide
	 * @param {IImageOpts} options - image options
	 * @return {Slide} this Slide
	 */
	addImage(options: IImageOpts): Slide {
		genObj.addImageDefinition(this, options)
		return this
	}

	/**
	 * Add media (audio/video) to Slide
	 * @param {MediaOpts} options - media options
	 * @return {Slide} this Slide
	 */
	addMedia(options: MediaOpts): Slide {
		genObj.addMediaDefinition(this, options)
		return this
	}

	/**
	 * Add speaker notes to Slide
	 * @docs https://gitbrent.github.io/PptxGenJS/docs/speaker-notes.html
	 * @param {string} notes - notes to add to slide
	 * @return {Slide} this Slide
	 */
	addNotes(notes: string): Slide {
		genObj.addNotesDefinition(this, notes)
		return this
	}

	/**
	 * Add shape to Slide
	 * @param {SHAPE_NAME} shapeName - shape name
	 * @param {ShapeOptions} options - shape options
	 * @return {Slide} this Slide
	 */
	addShape(shapeName: SHAPE_NAME, options?: ShapeOptions): Slide {
		// NOTE: As of v3.1.0, <script> users are passing the old shape object from the shapes file (orig to the project)
		// But React/TypeScript users are passing the shapeName from an enum, which is a simple string, so lets cast
		// <script./> => `pptx.shapes.RECTANGLE` [string] "rect" ... shapeName['name'] = 'rect'
		// TypeScript => `pptxgen.shapes.RECTANGLE` [string] "rect" ... shapeName = 'rect'
		//let shapeNameDecode = typeof shapeName === 'object' && shapeName['name'] ? shapeName['name'] : shapeName
		genObj.addShapeDefinition(this, shapeName, options)
		return this
	}

	/**
	 * Add table to Slide
	 * @param {TableRow[]} tableRows - table rows
	 * @param {ITableOptions} options - table options
	 * @return {Slide} this Slide
	 */
	addTable(tableRows: TableRow[], options?: ITableOptions): Slide {
		// FUTURE: we pass `this` - we dont need to pass layouts - they can be read from this!
		genObj.addTableDefinition(this, tableRows, options, this.slideLayout, this.presLayout, this.addSlide, this.getSlide)
		return this
	}

	/**
	 * Add text to Slide
	 * @param {string|IText[]} text - text string or complex object
	 * @param {ITextOpts} options - text options
	 * @return {Slide} this Slide
	 */
	addText(text: string | IText[], options?: ITextOpts): Slide {
		genObj.addTextDefinition(this, text, options, false)
		return this
	}

	/**
	 * Add xml to Slide
	 * @param {string} xml - xml string
	 * @return {Slide} this Slide
	 */
	addXML(xml: string): Slide {
		genObj.addXMLDefinition(this, xml)
		return this
	}
}
