/**
 * 新疆自驾游 - 腾讯地图 (V16 城市按钮方案)
 * 图钉：qq.maps.Marker（能显示）
 * 交互：地图下方一排城市按钮，点击 → 地图飞过去 + 弹出城市名
 * 彻底绕过 Marker click 和 DOM定位问题
 */

(function() {
    var DAYS = [
        { d:1,  c:"武汉",     lat:30.5928, lng:114.3055 },
        { d:2,  c:"西安",     lat:34.2658, lng:108.9541 },
        { d:3,  c:"武威",     lat:37.9282, lng:102.6365 },
        { d:4,  c:"哈密",     lat:42.8384, lng:93.5156  },
        { d:5,  c:"乌鲁木齐", lat:43.8256, lng:87.6168  },
        { d:6,  c:"布尔津",   lat:47.8483, lng:86.8575  },
        { d:7,  c:"禾木村",   lat:48.2436, lng:87.0375  },
        { d:8,  c:"喀纳斯",   lat:48.6686, lng:87.0189  },
        { d:9,  c:"克拉玛依", lat:45.5936, lng:84.8870  },
        { d:10, c:"赛里木湖", lat:44.5926, lng:81.0144  },
        { d:11, c:"伊宁",     lat:43.9236, lng:81.3270  },
        { d:12, c:"那拉提",   lat:43.4226, lng:84.8846  },
        { d:13, c:"奎屯",     lat:44.4300, lng:84.8870  },
        { d:14, c:"张掖",     lat:38.9384, lng:100.4519 },
        { d:15, c:"兰州",     lat:36.0657, lng:103.8260 }
    ];

    function getColor(i) {
        if (i === 14) return '#764BA2'; // D15兰州 终点紫
        if (i === 13) return '#F5AF19'; // D14张掖 返程金
        if (i === 12) return '#F5AF19'; // D13奎屯 返程金
        if (i >= 5 && i <= 11) return '#11998E'; // D5-D11 北疆环线青
        if (i === 4) return '#11998E'; // D4乌鲁木齐 入疆青
        if (i >= 1 && i <= 3) return '#FF6B6B'; // D1-D3 入疆红
        return '#FF6B6B';
    }

    function makeIcon(num, color) {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">' +
            '<defs><filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity=".35"/></filter></defs>' +
            '<path d="M18 3C9.7 3 3 9.7 3 18c0 10.5 15 25 15 25s15-14.5 15-25C33 9.7 26.3 3 18 3z"' +
                ' fill="' + color + '" stroke="#fff" stroke-width="2.5" filter="url(#sh)"/>' +
            '<text x="18" y="22" text-anchor="middle" fill="#fff" font-size="15"' +
                ' font-weight="bold" font-family="-apple-system,sans-serif">' + num +
            '</text></svg>';
        return new qq.maps.MarkerImage(
            'data:image/svg+xml,' + encodeURIComponent(svg),
            new qq.maps.Size(36, 46), new qq.maps.Point(0, 0),
            new qq.maps.Point(18, 46), new qq.maps.Size(36, 46)
        );
    }

    var markers = [];
    var infoWin = null;
    var mapInstance = null;

    function init() {
        var container = document.getElementById("tencent-map");
        if (!container) return;

        mapInstance = new qq.maps.Map(container, {
            center: new qq.maps.LatLng(40, 92),
            zoom: 5,
            zoomControl: true,
            panControl: false
        });

        // InfoWindow（全局复用）
        infoWin = new qq.maps.InfoWindow({
            maxWidth: 240,
            zIndex: 500
        });

        // 创建所有Marker
        for (var i = 0; i < DAYS.length; i++) {
            var day = DAYS[i];
            var color = getColor(i);
            var pos = new qq.maps.LatLng(day.lat, day.lng);

            var m = new qq.maps.Marker({
                position: pos,
                map: mapInstance,
                icon: makeIcon(day.d, color),
                zIndex: 100 + i,
                title: 'D' + day.d + ' ' + day.c
            });

            markers.push({ marker: m, pos: pos, day: day, color: color });
        }
        console.log('[地图] ' + markers.length + ' 个标记创建完成');

        // ====== 创建城市按钮行 ======
        createCityButtons();

        // 自适应视野
        setTimeout(function() {
            var bounds = new qq.maps.LatLngBounds();
            for (var b = 0; b < DAYS.length; b++)
                bounds.extend(new qq.maps.LatLng(DAYS[b].lat, DAYS[b].lng));
            mapInstance.fitBounds(bounds, { padding: 80 });
        }, 600);

        console.log('[地图] ✅ 初始化完成');
    }

    // ====== 城市按钮行 + 点击交互 ======
    function createCityButtons() {
        var container = document.getElementById("tencent-map");
        if (!container || !container.parentElement) return;

    }

    // 弹出城市名标签
    function showLabel(data) {
        var content =
            '<div style="text-align:center;padding:10px 8px;">' +
                '<div style="font-size:20px;font-weight:bold;color:' + data.color + ';margin-bottom:6px;">' +
                    '第 ' + data.day.d + ' 天' +
                '</div>' +
                '<div style="font-size:15px;font-weight:600;color:#333;background:#f8f9fa;' +
                    'padding:8px 20px;border-radius:10px;display:inline-block;border:2.5px solid ' + data.color + ';' +
                    'box-shadow:0 3px 12px rgba(0,0,0,0.1);white-space:nowrap;">' +
                    data.day.c +
                '</div>' +
            '</div>';
        infoWin.setContent(content);
        infoWin.open(mapInstance, data.marker);
    }

    // 等待API
    function wait() {
        if (typeof qq !== 'undefined' && qq.maps && qq.maps.Map)
            setTimeout(init, 300);
        else
            setTimeout(wait, 150);
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', function() { setTimeout(wait, 200); });
    else
        setTimeout(wait, 200);
})();
