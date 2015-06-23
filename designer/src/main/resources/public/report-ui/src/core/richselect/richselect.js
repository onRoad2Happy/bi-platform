/**
 * callback 数据是当前选中三级分类的name的数组
 * 考虑到多次引用 所以options 修改为以对象为元素的数组
 * 窗体的宽度可自行设置
 **/
(function ($) {
    var defaults = [];
    var checkStatusCache = {};
    var textCache = {};
    var clickCheckbox = [];
    // 创建dom
    function createDom($ele) {
        // 累计的添加
        var length = $('.sxwzbText').length;
        $('<div class="sxwzbText sxwzbText' + length + '" data-index=' + length + '><p class="sxwzbButton"><span></span></p></div>').appendTo($ele);
        $('<div class="sxwzbContent sxwzbContent' + length + '" data-index=' + length + '></div>').appendTo(document.body);
        var $currentContent = $('.sxwzbContent' + length);
        return $currentContent;
    }
    // 渲染窗体内部
    function renderCheckbox(data) {
        var index = $('.sxwzbText').length - 1;
        textCache[index] = [];
        if (!data) {
            alert("数据给的不对");
            return;
        }
        var htmlArray = [];
        for (var i = 0, l = data.length; i < l; i++) {
            // 构建大分类
            htmlArray.push('<div data-value="'+ data[i].name +'" class="sxwzbTitle">'+ data[i].caption +'</div>');

            var children = data[i].children;
            htmlArray.push('<div class="sxwzbBoxs">');
            if (!children){
                continue;
            }
            // 构建分类2
            for (var j = 0, le = children.length; j < le; j++) {
                htmlArray.push('<div class="sxwzbType"><div class="sxwzbCategories">'
                    + '<input type="checkbox" id=' + children[j].name + ' class="sxwzbCheckBoxP">'
                    + '<label for='+ children[j].name + '>'
                    +  children[j].caption
                    + '</label>'
                    + '</div><div class="sxwzbSubdivisions">'
                );
                var grandson = children[j].children;
                if (!grandson) {
                    continue;
                }
                // 构建分类3
                for (var m = 0, n = grandson.length; m < n; m++) {
                    checkStatusCache[grandson[m].name] = checkStatusCache[grandson[m].name] || grandson[m].selected;
                    htmlArray.push('<div class="sxwzbSubdivision">'
                        + '<input class="sxwzbCheckBoxC" data-name="' + grandson[m].name +'" type="checkbox" id=' + grandson[m].name + ' ' + (grandson[m].selected === "true"? "checked": "")+'>'
                        + '<label for='+ grandson[m].name + '>'
                        +  grandson[m].caption
                        + '</label>'
                        + '</div>'
                    );
                    grandson[m].selected === "true" && textCache[index].push(grandson[m].caption);
                }
                htmlArray.push('</div></div>');
            }
            htmlArray.push('</div>');
        }
        htmlArray.push('<div class="sxwzbButtons"><span class="uiButton uiButton-ok">确定</span>'
        + '<span class="uiButton uiButton-circle">取消</span></div>');
        return htmlArray.join('');
    }
    // 文本框显示选中元素
    function renderInitStatus(i) {
        var text = [];
        var i = arguments[0] === undefined? $('.sxwzbText').length - 1: i;
        $.each($('.sxwzbContent' + i).find('input[type="checkbox"]:checked'), function(j, item){
            text.push($(item).siblings('label').text());
        })
        $('.sxwzbText' + (i) + ' .sxwzbButton span').text(text);
    }

    // 判断是否为全选
    function judgeCheckbox(index) {
        var index = arguments[0] === undefined? $('.sxwzbText').length - 1: index;
        $.each($('.sxwzbContent' + index).find('.sxwzbType'), function(i, item){
            var childNode = $(item).find('.sxwzbSubdivisions input[type="checkbox"]'),
                checkedItem = $(item).find('.sxwzbSubdivisions input[type="checkbox"]:checked');

            var checkStatus = ((childNode.length === checkedItem.length)
            && childNode.length > 0)? true: false;
            $(item).find('.sxwzbCheckBoxP').prop('checked', checkStatus);
        })
    }
    // 窗体的显示与隐藏
    function bindEvent(ele) {
        ele.delegate($('.sxwzbButton'), 'click', function(e) {
            var target = e.target;
            var index = $(target).parents('.sxwzbText').attr('data-index');
            $('.sxwzbContent' + index).toggle().siblings('.sxwzbContent').hide();
        })
    }

    function bindChekboxEvent($parent) {
        var options = defaults;
        /**
         * 每个input的点击事件
         * checkStatus当前checkbox选中状态
         * parentNode 当前父元素sxwzbType
         * childNode 二级分类
         * checkboxP 一级分类
         */
        $parent.delegate($('input[type="checkbox"]'), 'click', function(e) {
            var $self = $(e.target);
            var tag =/input/i;
            if (!tag.test($self[0].tagName)) {
                return;
            }
            // 当前checkbox选中状态
            var checkStatus = $self.prop('checked'),
                parentNode = $self.parents('.sxwzbType'),
                childNode = parentNode.find('.sxwzbSubdivisions input[type="checkbox"]'),
                checkboxP = parentNode.find('.sxwzbCheckBoxP'),
                checkedItem = parentNode.find('.sxwzbSubdivisions input[type="checkbox"]:checked');
            var index = $(this).attr('data-index');
            clickCheckbox[index] = clickCheckbox[index] || {};
            // 点击一级分类时选中所有二级分类
            if ($self.hasClass('sxwzbCheckBoxP')) {
                $.each(childNode, function(i, item) {
                    clickCheckbox[index][$(item).attr('data-name')] = $(item).prop('checked')? false: true;
                    $(item).prop('checked', checkStatus);
                })
            } else {
                // 全部选中时，选中前面的大类
                var checkStatus1 = ((childNode.length === checkedItem.length)
                && childNode.length > 0)? true: false;
                checkboxP.prop('checked', checkStatus1);
                clickCheckbox[index][$self.attr('data-name')] = checkStatus;
            }
        })
        /**
         * 点击确定 重新处理
         *
         */
        $parent.delegate($('.uiButton-ok'), 'click', function(e) {
            var $target = $(e.target);
            if (!$target.hasClass('uiButton-ok')) {
                return;
            }
            var index = $(this).attr('data-index');
            var $button = $('.sxwzbText' + index).find('.sxwzbButton');
            clickCheckbox[index] = clickCheckbox[index] || {};
            var sxwzbCheckBoxC = $('.sxwzbContent' + index).find('.sxwzbCheckBoxC');
            var idArray = [];
            $.each(sxwzbCheckBoxC, function(i, item) {
                if ($(item).prop('checked')) {
                    idArray.push($(item).attr('data-name'));
                }
            })
            // 重新设置文本框中为选中的元素
            renderInitStatus(Number(index));
            // callback
            if (options[index].clickCallback) {
                options[index].clickCallback(idArray.join(''));
            }
            // 重置clickCheckbox
            $.extend(checkStatusCache, clickCheckbox[index]);
            clickCheckbox[index] = {};
            // 关闭窗口
            $button.trigger('click');
        })
        /**
         * 点击取消的时候 必须重置选中状态
         * 再重新判断是否为全选
         */
        $parent.delegate($('.uiButton-circle'), 'click', function(e) {
            var $target = $(e.target);
            if (!$target.hasClass('uiButton-circle')) {
                return;
            }
            var index = $(this).attr('data-index');
            var $button = $('.sxwzbText' + index).find('.sxwzbButton');
            clickCheckbox[index] = clickCheckbox[index] || {};

            for (var i in clickCheckbox[index]) {
                var status = clickCheckbox[index][i] ===true? false: true;
                // var status = $('.sxwzbContent' + index).find('#' + i).prop('checked') === true? false: true;
                $('.sxwzbContent' + index).find('#' + i).prop('checked', status);
                delete clickCheckbox[index][i];
            }
            $button.trigger('click');

            judgeCheckbox(index);
        })
    }
    /**
     *   窗体定位
     */
    function setStyle($content) {
        var index = $content.selector.replace('.sxwzbContent', '');
        var $currentText = $('.sxwzbText' + index);
        var offset = $currentText.offset();
        var top = offset.top;
        var left = offset.left;
        var bHeight = document.documentElement.clientHeight;
        var bWidth = document.documentElement.clientWidth;
        var contentWidth = $content.outerWidth();
        var contentHeight = $content.outerHeight();
        var spanWidth = $currentText.outerWidth();
        var spanHeight = $currentText.outerHeight();

        left  = left + contentWidth <= bWidth? left: left - contentWidth + spanWidth;
        top = top + contentHeight <= bHeight? top + spanHeight: top - contentHeight;
        $content.css({
            'left': left + 'px',
            'top': top + 'px'
        })
        // 绑定事件
        bindChekboxEvent($content);
    }
    $.fn.screenXingWeiZhiBiao = function (options) {
        defaults = defaults.concat(options);
        // $.extend(defaults, options);
        var parent = this;
        bindEvent(parent);

        return parent.each(function(i, item){
            var $content = createDom($(this), options);
            if (options[i] && options[i].data) {
                // render数据
                $content.append(renderCheckbox(options[i].data));
                setStyle($content, options);
                judgeCheckbox();
                renderInitStatus();
            } else {
                alert('参数给的不对.');
            }
        })
    }
})(jQuery);