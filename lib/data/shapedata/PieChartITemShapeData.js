Xr.data = Xr.data || {};

/**  
 * @classdesc DecorationTextsGraphicRow�� ���� ���� ���� ���� ��� �ִ� Ŭ�����Դϴ�.
 * @class
 * @param {Object} arg - ��ü�̸� x, y, texts �Ӽ��� �־�� ��. x�� �ؽ�Ʈ�� ��ġ�� ���� ��ǥ�� ���� X�� ���̸� y�� �ؽ�Ʈ�� ��ġ�� ���� ��ǥ�� ���� Y�� ��,
 *                       �׸��� texts�� �ؽ�Ʈ ���ڿ��� ���� �迭�Դϴ�.
 * @copyright [(��)��������]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.PieChartItemShapeData = Xr.Class({
    name: "PieChartItemShapeData",
    requires: [Xr.data.IShapeData, Xr.edit.ISnap],

    construct: function (/* {x:Number, y:Number, values:array of float, radiusOut:float, radiusIn:float } */ arg) {
        this._data = arg;

        this._mbr = new Xr.MBR();
    },

    methods: {
        /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm, /* optional Xr.symbol.IMarkerSymbol*/ markerSym) {
            var mbr = this.MBR();
            var coord = cm.V2W(x, y);

            return Xr.GeometryHelper.pointInMBR(mbr, coord, 0);
        },

        /* ShapeData */ clone: function () {
            //var arg = { x: this._data.x, y: this._data.y, text: this._data.text, offsetX: this._data.offsetX, offsetY: this._data.offsetY };

            var arg = {};
            for (k in this._data) {
                arg[k] = this._data[k];
            }

            var mbr = new Xr.MBR(this._mbr.minX, this._mbr.minY, this._mbr.maxX, this._mbr.maxY);

            var newThing = new Xr.data.PieChartItemShapeData(arg);
            newThing._mbr = mbr;

            return newThing;
        },

        data: function () {
            return this._data;
        },

        MBR: function () {
            return this._mbr;
        },

        /* PointD */ representativePoint: function () {
            return new Xr.PointD(_mbr.centerX(), _mbr.centerY());
        },

        /* Object {pt:PointD, angle:float}  */ representativePointWithAngle: function () {
            return null;
        },

        /* int */ type: function () {
            return Xr.data.ShapeType.PIE_CHART_ITEM_OBJECT;
        },

        /* ISkecth */ toSketch: function (/* EditManager */ editManager, /* int */ id, /* boolean */ bMeasured) {
            return undefined;
        },

        /*
		regenMBR: function (coordMapper:CoordMapper, symbol:FontSymbol) {
		    var height = coordMapper.mapLength(symbol.size());
		    var width = this._data.text.length * height;
		    var x = this._data.x;
		    var y = this._data.y;

		    if (this._mbr == undefined) this._mbr = new Xr.MBR();

		    this._mbr.minX = x - width;
		    this._mbr.minY = y - height;
		    this._mbr.maxX = x + width;
		    this._mbr.maxY = x + height;
        }
        */

        moveByOffset: function (/* number */ deltaX, /* number */ deltaY) {
            /*
            this._data.x += deltaX;
            this._data.y += deltaY;

            this._mbr.moveByOffset(deltaX, deltaY);
            */
        },

        updateControlPoint: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt, /* ouput PointD */ oldPt) {
            /*
            var offsetX = newPt.x - this._data.x;
            var offsetY = newPt.y - this._data.y;

            if (oldPt) oldPt.set(this._data.x, this._data.y);

            this._data.x = newPt.x;
            this._data.y = newPt.y;

            this._mbr.moveByOffset(offsetX, offsetY);
            */
        },

        moveControlPointByOffset: function (/* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) { },
        /* PointD */ removeVertex: function (/* int */ partIndex, /* int */ controlPointIndex) { },
        insertVertex: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtx) { },
        insertPart: function (/* int */ partIndex, /* Array of PointD */ pointList) { },
        /* Array of PointD */ removePart: function (/* int */ partIndex) { },
        /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) { return undefined; },
        /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) { return undefined },
        /* string */ toWKT: function (/* boolean */ bMulti) { return undefined; },
        /* boolean */ fromWKT: function (/* String */ wkt) { return false; }
    }
});