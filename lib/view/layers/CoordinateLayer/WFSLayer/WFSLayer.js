﻿Xr.layers = Xr.layers || {};

/**  
 * @classdesc OGC 표준인 WFS로 공간 데이터와 속성 데이터를 사용하는 수치지도 레이어에 대한 클래스입니다.
 * @class
 * @param {String} name - 레이어의 이름으로 고유한 ID 값
 * @param {Object} params - 레이어에 대한 옵션을 담기 위한 객체로써 최소한 WFS 서버에 대한 URL과 연결할 레이어 데이터의 이름을 각각 url 및 typeName에 담아야 합니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.WFSLayer = Xr.Class({
    name: "WFSLayer",
    extend: Xr.layers.CoordinateLayer,

    construct: function (name, params) {
        this.superclass(name, undefined);

        this._params = params;
        this._urlHeader = params.url;
        this._typeName = params.typeName;
        this._connected = false;
        this._proxy = params.proxy;
    },
 	
    methods: {
        connect: function (/* CoordMapper */ coordMapper, /* optional function */ callbackFunction) {
            if (this._urlHeader && this._typeName) {
                var url = this.connectionString();
                var req = new Xr.layers.WFSConnectionRequest(this._proxy, this._urlHeader, this._typeName, onConnectionCompleted);
                req.request();

                this._coordMapper = coordMapper;

                var caller = this;
                function onConnectionCompleted() {
                    var vectorType = req.vectorType();

                    /*
                        gml:PointPropertyType
                        gml:MultiPointPropertyType
                        gml:LineStringPropertyType
                        gml:MultiLineStringPropertyType
                        gml:PolygonPropertyType
                        gml:MultiPolygonPropertyType
                    */

                    var shapeType;
                    if (vectorType.indexOf("Polygon") != -1) shapeType = Xr.data.ShapeType.POLYGON;
                    else if (vectorType.indexOf("Point") != -1) shapeType = Xr.data.ShapeType.POINT;
                    else if (vectorType.indexOf("LineString") != -1) shapeType = Xr.data.ShapeType.POLYLINE;

                    caller._fieldCount = req.fieldCount();

                    // [ToDo] get real MBR using '?'.
                    caller._mbr = new Xr.MBR(Number.MIN_VALUE, Number.MIN_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
                    caller._connected = true;

                    caller._shapeRowSet = new Xr.data.ShapeRowSet(shapeType);

                    var fieldSet = req.fieldSet();
                    caller._attributeRowSet = new Xr.data.AttributeRowSet(fieldSet);

                    if (callbackFunction) {
                        callbackFunction(caller);
                    }
                }
            }
        },

        update: function(/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) {
            var mapScale = coordMapper.mapScale();
            //if (isNaN(mapScale)) return;
            var svg = this.container();

            if (this.visibility().needRendering(mapScale) || (this.label().enable() && this.label().visibility().needRendering(mapScale))) {
                if (svg.style.display != "block") svg.style.display = "block"

                var childNodes = svg.childNodes;
                var cntChildNodes = childNodes.length;
                var childNode;

                if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
                    //.
                } else if (mouseAction == Xr.MouseActionEnum.MOUSE_DRAG) {
                    /* !!
                    var shpRows = this.shapeRowSet().rows();			
                    for (var i = 0; i < cntChildNodes; i++) {
                        childNode = childNodes[i];

                        var row = shpRows[childNode.id]
                        if (row) {
                            childNode.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ")");
                        }
                    }
                    */

                    svg.style.top = offsetY + "px"; //!!
                    svg.style.left = offsetX + "px"; //!!
                } else {
                    // !! ->
                    if (mouseAction && mouseAction != Xr.MouseActionEnum.NO_MOUSE) {
                        svg.style.top = 0;
                        svg.style.left = 0;

                        var shpRows = this.shapeRowSet().rows();
                        for (var i = 0; i < cntChildNodes; i++) {
                            childNode = childNodes[i];

                            var row = shpRows[childNode.id]
                            if (row) {
                                childNode._offsetX += offsetX;
                                childNode._offsetY += offsetY;

                                childNode.setAttribute("transform",
                                    "translate(" + childNode._offsetX + "," + childNode._offsetY + ")");
                            }
                        }
                    }
                    // <- !!

                    var vMBR = coordMapper.viewportMBR();
                    //example -> http://localhost:8080/OGC/test/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=application/json&typeName=test:muan_bld&bbox=150636,245913,152001,246988

                    var queryString = encodeURI("service=wfs&version=1.0.0&outputFormat=application/json&request=GetFeature&typeName=" + this._typeName +
                        "&bbox=" + vMBR.minX + "," + vMBR.minY + "," + vMBR.maxX + "," + vMBR.maxY);

                    var url = this._urlHeader + "?" + queryString;

                    if (this._proxy != undefined) {
                        url = this._proxy + "?reqPrx|" + this._urlHeader + "|" + queryString;
                    }
                    
                    var caller = this;
                    function onQueryRequestCompleted() {
                        var mapContainer = caller.container().parentNode;
                        if (mapContainer) {
                            var e = Xr.Events.create(Xr.Events.LayerUpdateCompleted, { layerName: caller.name() });
                            Xr.Events.fire(mapContainer, e);
                        }
                    }

                    //* // NEW
                    var prevReq = this._req;
                    if (prevReq) {
                        prevReq.cancel();
                    }

                    var newReq = new Xr.layers.WFSQueryRequest(url, this, coordMapper, mouseAction, onQueryRequestCompleted);
                    newReq.request();
                    this._req = newReq;
                    //*/

                    /* // OLD
                    var req = new Xr.layers.ShapeMapQueryRequest(url, this, coordMapper, mouseAction, onQueryRequestCompleted);
                    req.request();
                    */

                }
            } else {
                if (svg.style.display != "none") svg.style.display = "none";

                /*
                var childNodes = this._svg.childNodes;
                var cntChildNodes = childNodes.length;

                for (var i = 0; i < cntChildNodes; i++) {
                    childNode = childNodes[0];
                    this._svg.removeChild(childNode);
                }
                */
                var svg = this._svg;
                while (svg.lastChild) {
                    svg.removeChild(svg.lastChild);
                }

                this.labelDrawer().clean(this.name(), true);
            }
        }
	}
});