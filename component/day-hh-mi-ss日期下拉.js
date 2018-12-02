
+function () {
	/* 时间选择控件   注：若存在this.hiddenDom，用js改变值时，需要手动触发change事件，使其值和this.mountedDom保持一致 */
	var defaultOptions = {
		format: 'd天h小时m分s秒',
		requiredValue: true,	// 值必填
		defaultValue: 1 * 24 * 60 * 60
	}
	function TimePanel(dom, opts) {
		$.extend(this, defaultOptions, opts);
		this._initDom(dom);
		this._init();
	}
	TimePanel.prototype._initDom = function (dom) {
		this.mountedDom = dom;
		$(dom).attr('readonly', 'true').css('backgroundColor', '#fff').css('cursor', 'default');
		if (dom.id && dom.id.substr(dom.id.lastIndexOf('_show')) === '_show') {
			var id = dom.id.substring(0, dom.id.lastIndexOf('_show'));
			var hiddenDom = $('#' + id);
			if (hiddenDom.length) {
				this.hiddenDom = hiddenDom[0];
				if (!this.hiddenDom.value && this.requiredValue) {
					this.hiddenDom.value = this.defaultValue
				}
			}
		}
		if (this.hiddenDom) {
			dom.value = this.formatValue(this.hiddenDom.value);		//初始值和hiddenDom保持一致
		} else if (!dom.value && this.requiredValue) {
			dom.value = this.formatValue(this.defaultValue);
		}
	}
	TimePanel.prototype._init = function () {
		var html = '<div class="yamu-time-panel" style="display:none"><ul class="time-choose"><li class="days"></li><li class="hours"></li><li class="minutes"></li><li class="seconds"></li></ul><div class="yamu-time-btn"><a href="javascript:void(0)" class="confirm">确定</a><a href="javascript:void(0)" class="cancel">取消</a></div></div>';
		$('body').append(html);
		var $rootDom = $('.yamu-time-panel').last();
		this.rootDom = $rootDom[0];
		this.rootDom.style.width = this.mountedDom.offsetWidth + 'px';
		this._initEvent();
	}
	TimePanel.prototype._adjustValue = function () {
		var $rootDom = $(this.rootDom),
			subHtml = '';
		var values = (this.mountedDom.value || this.formatValue(this.defaultValue)).match(new RegExp(this.format.replace(/d|h|m|s/g, '(\\d{1,2})')));
		values.shift();

		for (var i = 0; i < 8; i++) {
			subHtml += (values[0] == i) ? '<span class="cur">' + i + '</span>' : '<span>' + i + '</span>';
		}
		$rootDom.find('.days').html(subHtml);

		subHtml = '';
		for (i = 0; i < 24; i++) {
			subHtml += (values[1] == i) ? '<span class="cur">' + i + '</span>' : '<span>' + i + '</span>';
		}
		$rootDom.find('.hours').html(subHtml);

		subHtml = '';
		for (i = 0; i < 60; i++) {
			subHtml += (values[2] == i) ? '<span class="cur">' + i + '</span>' : '<span>' + i + '</span>';
		}
		$rootDom.find('.minutes').html(subHtml);

		subHtml = '';
		for (i = 0; i < 60; i++) {
			if (i % 5 == 0) {
				subHtml += (values[3] == i) ? '<span class="cur">' + i + '</span>' : '<span>' + i + '</span>';
			}
		}
		$rootDom.find('.seconds').html(subHtml);
		this._adjustPosition();
	}
	TimePanel.prototype._adjustPosition = function () {
		$(this.rootDom).find('span.cur').each(function (index, item) {
			var $item = $(item);
			$item.parent().css('margin-top', 80 - $item.outerHeight() * $item.index());		// 80为初始值，在css样式中设置
		});
	}
	TimePanel.prototype._initEvent = function () {
		var me = this;
		this.rootDom.addEventListener($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel', function (e) {
			e.stopPropagation();
			e.preventDefault();
		});
		$(this.rootDom).find('.time-choose').find('li').each(function (index, item) {
			item.addEventListener($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel', function (e) {
				var which = e.wheelDelta ? (e.wheelDelta / 120) : (- e.detail / 3);
				var cur = $(item).find('.cur').removeAttr('class');
				var curIndex = cur.index() + which * (-3);
				curIndex = Math.max(0, Math.min(curIndex, item.childElementCount - 1));
				item.children[curIndex].className = 'cur';
				me._adjustPosition();
			});
		}).end().on('click', 'span', function (e) {
			$(this).addClass('cur').siblings('.cur').removeAttr('class');
			me._adjustPosition();
			return;
		}).end().on('click', '.cancel', function (e) {
			me.hide();
		}).on('click', '.confirm', function (e) {
			me.mountedDom.value = me.getValue();
			if (me.hiddenDom) {
				me.hiddenDom.value = me.getValue(true);
			}
			me.hide();
		});

		$(document).click(function (e) {
			if (e.target !== me.mountedDom && !$(e.target).closest('.yamu-time-panel').length && !me.isHidden()) {
				me.hide();
			}
		})
		$(me.mountedDom).click(function (e) {
			if (me.isHidden()) {
				me.show();
			}
		});
		if (me.hiddenDom) {
			$(me.hiddenDom).on('change', function (e) {			// 点击页面修改按钮时
				var val = me.formatValue(this.value);
				if (me.mountedDom.value !== val) {
					me.mountedDom.value = val;
				}
			})
		}
	}
	TimePanel.prototype.show = function () {
		var style = {}, margin = 5, height = 224 + 2;	// 2为边框厚度
		var pos = this.mountedDom.getBoundingClientRect();
		var root = $(this.rootDom);
		var left = pos.left - (document.documentElement.scrollLeft || document.body.scrollLeft),
			top = pos.top - (document.documentElement.scrollTop || document.body.scrollTop),
			bottom = top + pos.offsetHeight;
		root.css('left', pos.left);
		if (window.innerHeight - pos.bottom > height + margin) {	// 距离底部高度大于“下拉框高度”
			root.css('top', pos.bottom + margin);
		} else {
			root.css('top', pos.top - margin - height);
		}
		this._adjustValue();
		root.css('width', this.mountedDom.offsetWidth).css('display', 'block');		// 若this.mountedDom是隐藏的，宽度为0，需要在每次显示时设置
	}
	TimePanel.prototype.hide = function () {
		this.rootDom.style.display = 'none';
	}
	TimePanel.prototype.isHidden = function () {
		return this.rootDom.style.display === 'none';
	}
	TimePanel.prototype.getValue = function (secondVal) {
		var arr = $(this.rootDom).find('.cur').map(function (index, item) {
			return parseInt(item.innerHTML);
		}).get();

		var val = ((arr[0] * 24 + arr[1]) * 60 + arr[2]) * 60 + arr[3] + '';
		return secondVal ? val : this.formatValue(val);
	}
	TimePanel.prototype.parseValue = function (val) {
		if (!val) {
			return '';
		}
		val = val.replace(/^\s+|\s+$/g, '');
		var arr = val.match(new RegExp(this.format.replace(/d|h|m|s/g, '(\\d{1,2})')));
		if (!arr) {
			return '';
		}
		arr.shift();
		return ((arr[0] * 24 + arr[1]) * 60 + arr[2]) * 60 + arr[3];
	}
	TimePanel.prototype.formatValue = function (val) {
		if (!val && val != '0') {
			return '';
		}
		var second, minute, hour, day;
		second = val % 60;
		val = (val - second) / 60;
		minute = val % 60;
		val = (val - minute) / 60;
		hour = val % 24;
		day = (val - hour) / 24;
		return (this.format || defaultOptions.format).replace('d', day).replace('h', hour).replace('m', minute).replace('s', second);		// 方法当作函数直接调用时，this.format不存在
	}

	$.fn.TimePanelFormatValue = TimePanel.prototype.formatValue;
	$.fn.TimePanel = function () {
		if (!this[0]) {
			console.warn('元素不存在，不能使用TimePanel');
			return;
		}
		if($(this).data('TimePanel')){
            return $(this).data('TimePanel');
		}
		var obj = new TimePanel(this[0]);
		$(this).data('TimePanel', obj);
        return obj;
	}



	/* 设备拓扑图控件 */
	/* svg - svg元素
	data - 数组，包含设备列表的信息，格式为 [{running: true, showDetail: false, name:'dev60', ip: '192.168.6.60', ..}]	running代表是否在允许，showDetail代表是否显示详情
	renderProps - 包含要渲染的设备属性，格式为 {name: true, ip: true, cpu: true, memory: '内存', nicin: '输入', nicout: '输出'} */
	function DeviceView(svg, data, renderFormat) {
		var renderProps = $.extend({}, renderFormat);
		delete renderProps.$inline;
		var renderPropsLength = Object.keys(renderProps).length,
			$inline = renderFormat.$inline || [],
			inlineProps = {};
		$inline.forEach(function(item){
			if(item.length !=2) throw '$inline配置错误，一行只能放2个数据信息';
			inlineProps[item[0]] = item[1];
			inlineProps[item[1]] = false;
		});
		var $svg = $(svg);

		+function initSvg() {
			$svg.append(createDom('g', { id: 'svg_view' }));
			var $defs = $(createDom('defs')).appendTo($svg);
			$(createDom('linearGradient', {
				id: 'deviceBackground',
				gradientTransform: 'rotate(90)'
			})).append(createDom('stop', { offset: '0', 'stop-color': '#f4f4f4' }))
				.append(createDom('stop', { offset: '30%', 'stop-color': '#fefefe' }))
				.append(createDom('stop', { offset: '33.3%', 'stop-color': '#fff' }))
				.append(createDom('stop', { offset: '100%', 'stop-color': '#e8e8e8' }))
				.appendTo($defs);
		}();

		var $view = $('#svg_view');
		var imageInitScale = 5;   // 缩略图初始大小
		var imageInfos = {
			server: { width: 116 / imageInitScale, height: 178 / imageInitScale, url: '/assets/img/server.png' },
			mac: { width: 200 / imageInitScale, height: 168 / imageInitScale, url: '/assets/img/mac.png' },
			stop: { width: 20, height: 20, url: '/assets/img/stop.png' },
			cloud: {width: 166, height: 122, url: '/assets/img/cloud.png'}
		}
		var fontSize = {
			name: 14,
			ip: 12
		}
		var detailBox = {
			showDetail: true,
			width: 160,
			height: 120,
			rxy: 4,
			fill: 'url(#deviceBackground)',
			stroke: '#c9c9c9',
			paddingY: 4,
			paddingX: 6,
			itemHeight: 24,
			keyValMargin: 20,
			textIndent: 36,
			barLength: 110,
			barHeight: 12,
			ellipseMargin: 20
		}
		detailBox.height = detailBox.paddingY * 2 + detailBox.itemHeight * (renderPropsLength - (renderFormat.$inline || []).length);

		var deviceData = initData(data);
		var slaveData = [], masterDeviceInfo;
		deviceData.forEach(function (deviceInfo) {
			if (deviceInfo.master) {
				masterDeviceInfo = deviceInfo;
			} else {
				slaveData.push(deviceInfo);
			}
		});
		detailBox.showDetail = slaveData.length * detailBox.width * 1.5 < window.innerWidth;

		var lines = deviceData.slice(1);
		var svgDimension = $svg[0].getBoundingClientRect();
		var viewTransform = {
			translateX: 0,
			translateY: 0,
			scale: 1
		};
		var centerX, centerY;
		+function locateDevice() {
			centerX = (svgDimension.right - svgDimension.left) / 2,
			centerY = (svgDimension.bottom - svgDimension.top) / 2;
			var count = deviceData.length,
				ellipseWidth = svgDimension.right - svgDimension.left - detailBox.ellipseMargin * 2 - detailBox.width,
				ellipseHeight = svgDimension.bottom - svgDimension.top - detailBox.ellipseMargin * 2 - detailBox.height,
				halfWidth = ellipseWidth / 2,
				halfHeight = ellipseHeight / 2;

			deviceData.forEach(function (item, index) {
				var svgInfo = item.svgInfo = {  // showDetail, width, height, cx, cy（绘制坐标）, cx0, cy0（初始坐标）,translateX, translateY
					showDetail: item.showDetail != null ? !!item.showDetail : (item.master ? true : detailBox.showDetail),
					translateX: 0,
					translateY: 0,
					cx0: 0,
					cy0: 0,
					get cx() { return this.cx0 + this.translateX },
					get cy() { return this.cy0 + this.translateY }
				};
				var angle = Math.PI * 2 - Math.PI * 2 / count * index;	// 顺时针排列
				if(count == 4){
					angle += Math.PI / 4;	// 从第一象限45度角开始
				}else if(count != 2){
					angle += Math.PI / 2;	// 从y轴正方向开始
				}
				if(angle > Math.PI * 2){
					angle -= Math.PI * 2;
				}
				var tanAngle = Math.tan(angle);
				svgInfo.cx0 = Math.round( (angle > Math.PI/2 && angle < Math.PI * 1.5 ? -1 : 1) * Math.sqrt(halfWidth * halfWidth * halfHeight * halfHeight / (halfHeight * halfHeight + halfWidth * halfWidth * tanAngle * tanAngle)) );
				svgInfo.cy0 = svgInfo.cx0 == 0 ? (angle > 0 && angle < Math.PI ? 1 : -1) * halfHeight : Math.round(svgInfo.cx0 * tanAngle);		// cx0为0，即90度和270度角，此时tanAngle的计算不准确（理论为无穷大）
				svgInfo.cx0 = centerX + svgInfo.cx0;
				svgInfo.cy0 = centerY - svgInfo.cy0;
			});
		}();

		+function initEvent() {
			var timeStamp;
			$svg.on('dblclick', '[class=device]', function (e) {
				var deviceInfo = getDeviceInfoByDevice(this);
				if (deviceInfo.running) {
					deviceInfo.svgInfo.showDetail = !deviceInfo.svgInfo.showDetail;
					redrawDevice(deviceInfo);
				}
			}).on('mousedown', '[class=device]', function (e) {
				var mousedownX = e.pageX,
					mousedownY = e.pageY;
				var me = $(this);
				var id = this.id;
				var deviceInfo = getDeviceInfoByDevice(me);
				var redrawed = false;
				var svgInfoTranslateX = deviceInfo.svgInfo.translateX, svgInfoTranslateY = deviceInfo.svgInfo.translateY;
				timeStamp = e.timeStamp;
				$svg.on('mousemove', function (e) {   // 最终坐标cx = 初次绘制时距离(cx0) + 偏移距离(svgInfo.translateX) = 重绘时距离 + transform样式的偏移(moveX)
					if (timeStamp && (e.timeStamp - timeStamp < 10)) {  //处理chrome点击时会触发mousemove的问题
						return;
					}
					if (!redrawed) {                    // 重绘代码在mousemove事件中，避免过多触发mousedown，且和dblclick的重绘冲突
						redrawDevice(deviceInfo);       // 重绘设备，保证z-index最大，且使之前偏移距离清零
						me = $('#' + id);
						redrawed = true;
					}
					var moveX = parseInt((e.pageX - mousedownX) / viewTransform.scale),
						moveY = parseInt((e.pageY - mousedownY) / viewTransform.scale);
					me.attr('transform', 'translate(' + moveX + ',' + moveY + ')');
					drawLineByDevice(deviceInfo);

					deviceInfo.svgInfo.translateX = svgInfoTranslateX + moveX;
					deviceInfo.svgInfo.translateY = svgInfoTranslateY + moveY;
				});
				return false;
			});
			$svg.on('mousedown', function (e) {
				var mousedownX = e.pageX,
					mousedownY = e.pageY;
				var curX = viewTransform.translateX, curY = viewTransform.translateY;
				$svg.on('mousemove', function (e) {
					var moveX = e.pageX - mousedownX,
						moveY = e.pageY - mousedownY;
					viewTransform.translateX = curX + moveX;
					viewTransform.translateY = curY + moveY;
					setViewTransform();
				});
			});

			$(document).on('mouseup', function (e) {
				$svg.off('mousemove');
			});
			document.ondragstart = function(){	// firefox上image元素会被拖动
				return false;
			}

			$svg.get(0).addEventListener($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel', function (e) {
				var which = e.wheelDelta ? (e.wheelDelta / 120) : (- e.detail / 3);
				var scale = which > 0 ? which * 1.2 : -which * 0.8;
				scale = viewTransform.scale * scale;
				viewTransform.scale = Math.min(8, Math.max(scale, 0.2));
				setViewTransform();
				e.stopPropagation();
			});

		}();

		drawView();

		function syncData(data) {    // 可用于实时更新视图
			var newData = initData(data);
			if (newData.length != deviceData.length) {
				drawView();
				return;
			}
			for (var i = 0; i < newData.length; i++) {
				if (newData[i].master != deviceData[i].master || newData[i].server != deviceData[i].server || newData[i].name != deviceData[i].name || newData[i].ip != deviceData[i].ip) {
					drawView();
					return;
				} else {
					$.extend(deviceData[i], newData[i]);
				}
			}
			$svg.find('.device').each(function (_, item) {
				var deviceInfo = getDeviceInfoByDevice(item);
				if (deviceInfo.svgInfo.showDetail) {
					renderChildItems(deviceInfo);
				}
			});



		}
		function initData(data) {
			return data.slice().sort(function (item1, item2) {
				var count1 = (item1.master ? 100 : 0) + (item1.server ? 10 : 0),
					count2 = (item2.master ? 100 : 0) + (item2.server ? 10 : 0);
				return count1 != count2 ? count1 < count2 : item1.name > item2.name;
			});
		}
		function createDom(tag, attr, children) {
			var dom = document.createElementNS('http://www.w3.org/2000/svg', tag);
			attr = attr ? attr : {};
			for (var key in attr) {
				if (key === 'children') {
					dom.innerHTML = attr[key];
				} else if (key === 'xlink:href') {
					dom.setAttributeNS('http://www.w3.org/1999/xlink', key, attr[key]);
				} else {
					dom.setAttribute(key, attr[key]);

				}
			}
			if (children) {
				dom.innerHTML = children;
			}
			return dom;
		};
		function drawView() {
			$('#svg_view').html('').removeAttr('transform');
			deviceData.forEach(function (deviceInfo) {
				drawDeviceLine(deviceInfo);
			});
			drawCloud();
			deviceData.forEach(function (deviceInfo) {
				drawDevice(deviceInfo);
			});
		}
		function redrawDevice(deviceInfo) {
			var $dom = getDeviceDomByDeviceInfo(deviceInfo);
			$dom && $dom.remove();
			drawLineByDevice(deviceInfo);
			drawDevice(deviceInfo);
		}
		function drawLineByDevice(deviceInfo) {
			drawDeviceLine(deviceInfo);
		}
		function drawCloud(){
			$view.append(createDom('image', {
				'class': 'device-cloud',
				x: centerX - imageInfos.cloud.width / 2,
				y: centerY - imageInfos.cloud.height / 2,
				width: imageInfos.cloud.width,
				height: imageInfos.cloud.height,
				'xlink:href': imageInfos.cloud.url
			}));
		}
		function drawDevice(deviceInfo) {
			if (deviceInfo.svgInfo.showDetail) {
				drawDeviceDetail(deviceInfo);
				return;
			}
			var imageInfo = deviceInfo.server ? imageInfos.server : imageInfos.mac;
			var svgInfo = deviceInfo.svgInfo;
			var x = svgInfo.cx - imageInfo.width / 2,
				y = svgInfo.cy - imageInfo.height / 2;

			var g = createDom('g', {
				'style': 'cursor: default',
				'class': 'device',
				'id': 'device' + deviceData.indexOf(deviceInfo)
			});
			g.appendChild(createDom('image', {
				x: x,
				y: y,
				width: imageInfo.width,
				height: imageInfo.height,
				'xlink:href': imageInfo.url
			}));
			g.appendChild(createDom('text', {
				x: x + imageInfo.width / 2 + 'px',
				y: y + imageInfo.height + fontSize.name / 2 + 'px',
				'text-anchor': 'middle',
				'dominant-baseline': 'middle',
				'font-size': fontSize.name + 'px',
				stroke: 'black',
				children: deviceInfo.name
			}));
			g.appendChild(createDom('text', {
				x: x + imageInfo.width / 2 + 'px',
				y: y + imageInfo.height + fontSize.name + fontSize.ip / 2 + 'px',
				'text-anchor': 'middle',
				'dominant-baseline': 'middle',
				'font-size': fontSize.ip + 'px',
				stroke: 'black',
				children: deviceInfo.ip
			}));
			if (!deviceInfo.running) {
				imageInfo = imageInfos.stop;
				g.appendChild(createDom('image', {
					x: svgInfo.cx - imageInfo.width / 2,
					y: svgInfo.cy - imageInfo.height / 2,
					width: imageInfo.width,
					height: imageInfo.height,
					'xlink:href': imageInfo.url
				}));
			}

			$view.append(g);

		}
		function drawDeviceDetail(deviceInfo) {
			var deviceDom = createDom('g', {
				'class': 'device',
				'id': 'deviceDetail' + deviceData.indexOf(deviceInfo),
				'style': 'cursor:default'
			});
			$view.append(deviceDom);
			addContainerItem(deviceDom, deviceInfo);
			renderChildItems(deviceInfo);
		}
		function renderChildItems(deviceInfo) {
			var deviceDom = getDeviceDomByDeviceInfo(deviceInfo);
			var $container = $(deviceDom).find('.deviceContainer');
			if (!$container.length) {
				console.error('renderChildItems没有可操作的元素');
				return;
			}
			if ($container.find('g').length) {  // 已经渲染过
				Object.keys(renderProps).forEach(function (prop) {
					var $deviceItemVal = $container.find('.deviceItem_' + prop);
					if ($deviceItemVal.is('text')) {
						$deviceItemVal.text(deviceInfo[prop] || deviceInfo[prop] === 0 ? deviceInfo[prop] : '');
					} else if ($deviceItemVal.is('rect')) {
						var text = Math.max(0, Math.min(100, parseInt(deviceInfo[prop]) || 0))
						$deviceItemVal.attr('width', detailBox.barLength * text / 100).attr('fill', text < 40 ? 'green' : (text < 70 ? 'yellow' : 'red'));
					} else {
						throw '未实现的svg渲染组件';
					}

				});
			} else {
				Object.keys(renderProps).forEach(function (prop) {
					if (prop == 'name' || prop == 'ip') {   // 必填，已在addContainerItem()中渲染
						return;
					} else if (prop == 'cpu' || prop == 'memory') {
						appendChildItem($container, deviceInfo, prop, { type: 'bar' });
					} else if (inlineProps[prop]) {
						appendChildItem($container, deviceInfo, prop, { type: 'inline' });
					} else if (inlineProps[prop] !== false) {
						appendChildItem($container, deviceInfo, prop);
					}
				});
			}
		}
		function addContainerItem(deviceDom, deviceInfo) {
			var svgInfo = deviceInfo.svgInfo;
			var x = svgInfo.cx - detailBox.width / 2,
				y = svgInfo.cy - detailBox.height / 2;
			deviceDom.appendChild(createDom('rect', {
				x: x,
				y: y,
				width: detailBox.width,
				height: detailBox.height,
				rx: detailBox.rxy,
				ry: detailBox.rxy,
				fill: detailBox.fill,
				stroke: detailBox.stroke
			}));
			var container = createDom('g', {
				'class': 'deviceContainer'
			});
			deviceDom.appendChild(container);
			var imageWidth = imageInfos[deviceInfo.server ? 'server' : 'mac'].width * 0.8,
				imageHeight = imageInfos[deviceInfo.server ? 'server' : 'mac'].height * 0.8;
			deviceDom.appendChild(createDom('image', {
				x: x + detailBox.paddingX,
				y: y + detailBox.paddingY - imageHeight / 2,
				width: imageWidth + 'px',
				height: imageHeight + 'px',
				'xlink:href': imageInfos[deviceInfo.server ? 'server' : 'mac'].url
			}));
			appendChildItem(container, deviceInfo, 'name', { type: 'onlyText' });
			appendChildItem(container, deviceInfo, 'ip', { type: 'onlyText', textColor: '#cc2200' });
		}
		function appendChildItem($container, deviceInfo, prop, option) {  // option {textAlign, keyColor, textColor, marginTop, keyFontSize, textFontSize, hasKey(默认true)}
			if ($container.nodeName) {
				$container = $($container);
			}
			option = option || {};
			if (option.type == 'onlyText') {
				appendChildItemOnlyText($container, deviceInfo, prop, option);
			} else if (option.type == 'bar') {
				appendChildItemBar($container, deviceInfo, prop, option);
			} else if (option.type == 'inline') {
				appendChildItemInline($container, deviceInfo, prop, option);
			} else {
				appendChildItemDefault($container, deviceInfo, prop, option);
			}
		}
		function appendChildItemOnlyText($container, deviceInfo, prop, option) {
			var text = deviceInfo[prop] || deviceInfo[prop] === 0 ? deviceInfo[prop] : '';
			var svgInfo = deviceInfo.svgInfo;
			var itemCount = $container.find('.deviceItem').length;
			var x0 = svgInfo.cx - detailBox.width / 2,
				y0 = svgInfo.cy - detailBox.height / 2;
			var drawX = x0 + detailBox.paddingX + detailBox.textIndent,
				drawY = y0 + detailBox.paddingY + itemCount * detailBox.itemHeight;
			$container.append(createDom('text', {
				'class': 'deviceItem deviceItem_' + prop,
				x: drawX,
				y: drawY + detailBox.itemHeight / 2,
				children: text,
				fill: option.textColor || '#000',
				'dominant-baseline': 'middle',
				'font-size': option.textFontSize || 14
			}));
		}
		function appendChildItemDefault($container, deviceInfo, prop, option) {
			var text = deviceInfo[prop] || deviceInfo[prop] === 0 ? deviceInfo[prop] : '';
			var svgInfo = deviceInfo.svgInfo;
			var itemCount = $container.find('.deviceItem').length;
			var x0 = svgInfo.cx - detailBox.width / 2,
				y0 = svgInfo.cy - detailBox.height / 2;
			var drawX = x0 + detailBox.paddingX,
				drawY = y0 + detailBox.paddingY + itemCount * detailBox.itemHeight;
			var $deviceItem = $(createDom('g', {
				'class': 'deviceItem'
			})).appendTo($container);

			$deviceItem.append(createDom('text', {
				x: svgInfo.cx - detailBox.keyValMargin / 2,
				y: drawY + detailBox.itemHeight / 2,
				children: (renderProps[prop] === true ? prop : renderProps[prop]) + ':',
				fill: option.keyColor || 'black',
				'text-anchor': 'end',
				'dominant-baseline': 'middle',
				'font-size': option.keyFontSize || 12
			})).append(createDom('text', {
				'class': 'deviceItem_' + prop,
				x: svgInfo.cx + detailBox.keyValMargin / 2,
				y: drawY + detailBox.itemHeight / 2,
				children: text,
				fill: option.textColor || '#cc2200',
				'dominant-baseline': 'middle',
				'font-size': option.textFontSize || 12
			}));
		}
		function appendChildItemBar($container, deviceInfo, prop, option) {
			var text = Math.max(0, Math.min(100, parseInt(deviceInfo[prop]) || 0));
			var svgInfo = deviceInfo.svgInfo;
			var itemCount = $container.find('.deviceItem').length;
			var x0 = svgInfo.cx - detailBox.width / 2,
				y0 = svgInfo.cy - detailBox.height / 2;
			var drawX = svgInfo.cx + detailBox.width / 2 - detailBox.paddingX - detailBox.barLength - detailBox.keyValMargin / 2,
				drawY = y0 + detailBox.paddingY + itemCount * detailBox.itemHeight;
			var $deviceItem = $(createDom('g', {
				'class': 'deviceItem'
			})).appendTo($container);


			$deviceItem.append(createDom('text', {
				x: drawX,
				y: drawY + detailBox.itemHeight / 2,
				children: renderProps[prop] === true ? prop : renderProps[prop],
				fill: option.keyColor || 'black',
				'text-anchor': 'end',
				'dominant-baseline': 'middle',
				'font-size': option.keyFontSize || 14
			}));

			if ($.isNumeric(text)) {
				var color = text < 40 ? 'green' : (text < 70 ? 'yellow' : 'red');
				$deviceItem.append(createDom('rect', {
					'class': 'deviceItem_' + prop,
					x: drawX + detailBox.keyValMargin / 2,
					y: drawY + detailBox.itemHeight / 2 - detailBox.barHeight / 2,
					width: detailBox.barLength * text / 100,
					height: detailBox.barHeight,
					fill: color
				}));
			}

			$deviceItem.append(createDom('rect', {
				x: drawX + detailBox.keyValMargin / 2,
				y: drawY + detailBox.itemHeight / 2 - detailBox.barHeight / 2,
				width: detailBox.barLength,
				height: detailBox.barHeight,
				stroke: '#ccc',
				fill: 'transparent'
			}));


		}
		function appendChildItemInline($container, deviceInfo, prop, option) {
			var text = deviceInfo[prop] || deviceInfo[prop] === 0 ? deviceInfo[prop] : '';
			var svgInfo = deviceInfo.svgInfo;
			var itemCount = $container.find('.deviceItem').length;
			var x0 = svgInfo.cx - detailBox.width / 2,
				y0 = svgInfo.cy - detailBox.height / 2;
			var drawX = x0 + detailBox.paddingX,
				drawY = y0 + detailBox.paddingY + itemCount * detailBox.itemHeight;
			var $deviceItem = $(createDom('g', {
				'class': 'deviceItem'
			})).appendTo($container);

			$deviceItem.append(createDom('text', {
				x: drawX,
				y: drawY + detailBox.itemHeight / 2,
				children: (renderProps[prop] === true ? prop : renderProps[prop]) + ':',
				fill: option.keyColor || 'black',
				'dominant-baseline': 'middle',
				'font-size': option.keyFontSize || 12
			})).append(createDom('text', {
				'class': 'deviceItem_' + prop,
				x: svgInfo.cx - detailBox.width / 4,
				y: drawY + detailBox.itemHeight / 2,
				children: text,
				fill: option.textColor || '#cc2200',
				'dominant-baseline': 'middle',
				'font-size': option.textFontSize || 12
			}));

			prop = inlineProps[prop];
			text = deviceInfo[prop] || deviceInfo[prop] === 0 ? deviceInfo[prop] : '';
			$deviceItem.append(createDom('text', {
				x: svgInfo.cx,
				y: drawY + detailBox.itemHeight / 2,
				children: (renderProps[prop] === true ? prop : renderProps[prop]) + ':',
				fill: option.keyColor || 'black',
				'dominant-baseline': 'middle',
				'font-size': option.keyFontSize || 12
			})).append(createDom('text', {
				'class': 'deviceItem_' + prop,
				x: svgInfo.cx + detailBox.width / 4,
				y: drawY + detailBox.itemHeight / 2,
				children: text,
				fill: option.textColor || '#cc2200',
				'dominant-baseline': 'middle',
				'font-size': option.textFontSize || 12
			}));
		}
		function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
			var x10 = x1 - x0, y10 = y1 - y0, x32 = x3 - x2, y32 = y3 - y2;
			var t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / (y32 * x10 - x32 * y10);
			return [x0 + t * x10, y0 + t * y10];
		}
		function polygonIntersectPoint(deviceInfo, x, y) {   // 求点和矩形的交点
			var cx = deviceInfo.svgInfo.cx,
				cy = deviceInfo.svgInfo.cy;
			var halfWidth = deviceInfo.svgInfo.showDetail ? detailBox.width / 2 : imageInfos[deviceInfo.server ? 'server' : 'mac'].width / 2,
				halfHeight = deviceInfo.svgInfo.showDetail ? detailBox.height / 2 : imageInfos[deviceInfo.server ? 'server' : 'mac'].height / 2;
			var sign = cx > x ? -1 : 1;
			var line1 = [{ x: cx + halfWidth * sign, y: 10 }, { x: cx + halfWidth * sign, y: 20 }];  //矩形离点较近的高
			sign = cy > y ? -1 : 1;
			var line2 = [{ x: 10, y: cy + halfHeight * sign }, { x: 20, y: cy + halfHeight * sign }];   //矩形离点较近的宽
			var point = intersect(cx, cy, x, y, line1[0].x, line1[0].y, line1[1].x, line1[1].y);
			if (!(point[1] >= cy - halfHeight && point[1] <= cy + halfHeight)) {
				point = intersect(cx, cy, x, y, line2[0].x, line2[0].y, line2[1].x, line2[1].y);
			}
			return point;
		}
		function drawDeviceLine(deviceInfo) {
			var cx = deviceInfo.svgInfo.cx,
				cy = deviceInfo.svgInfo.cy;
			var id = 'line' + deviceData.indexOf(deviceInfo);
			if ($('#' + id).length) {
				$('#' + id).attr({
					x1: centerX,
					y1: centerY,
					x2: cx,
					y2: cy
				});
			} else {
				$view.append(createDom('line', {
					x1: centerX,
					y1: centerY,
					x2: cx,
					y2: cy,
					stroke: '#ccc',
					id: id,
					'class': 'line'
				}));
			}

		}

		function setViewTransform() {
			var centerX = (svgDimension.right - svgDimension.left) / 2,
				centerY = (svgDimension.bottom - svgDimension.top) / 2;
			var translate1 = 'translate(' + centerX + ',' + centerY + ')',
				scale = 'scale(' + viewTransform.scale + ')',
				translate2 = 'translate(' + -centerX + ',' + -centerY + ')',
				translate3 = 'translate(' + viewTransform.translateX + ',' + viewTransform.translateY + ')';
			$view.attr('transform', translate1 + scale + translate2 + translate3);
		}
		function getDeviceInfoByDevice(dom) {
			if (dom.length) {
				dom = dom[0];
			}
			return deviceData[dom.id.match(/\D+(\d+)/)[1]];
		}
		function getDeviceDomByDeviceInfo(deviceInfo) {
			var id = deviceData.indexOf(deviceInfo);
			var $dom = $('#deviceDetail' + id + ',#device' + id);
			return $dom.length ? $dom : null;
		}
		return {
			syncData: syncData
		}
	}
	$.fn.DeviceView = function (data, renderProps) {
		if (!this[0]) {
			console.warn('元素不存在，不能使用TimePanel');
			return;
		}
		return DeviceView(this[0], data, renderProps);
	}
}();
