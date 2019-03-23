$(function () {
    'use strict';

    var files = [];
    var $files = $('#files');

    $('#fileupload').on('change', function (e) {
        Array.from(e.target.files || []).forEach((file) => {

            file.id = [file.lastModified, file.size, file.name].join('_');

            if (exist(file))
                return;

            files.push(file);

            var $file = get$ImageRow(file);
            $files.append($file);

        })
    });


    $('#submit').on('click', function () {

        var data = new FormData();
        files.forEach(function (file) {
            data.append('files', file);
        });


        $.ajax({
            type: 'POST',
            url: '/images',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                console.log("success");
                console.log(data);
            },
            error: function (data) {
                console.log("error");
                console.log(data);
            }
        });
    });

    function get$ImageRow(file) {

        var $file = $('<div class="row file-row"></div>');
        $file.attr('data-id', file.id);

        var $media = $('<div class="media image-row"></div>');
        $file.append($media);

        var $mediaImg = $('<img class="align-self-center mr-3" >');
        $media.append($mediaImg);

        var $mediaBody = $('<div class="media-body "></div>');

        var $imageInfo = $('<div class="image-info"></div>');
        $imageInfo.append([
            '<p>name: <strong>' + file.name + '</strong></p>',
            '<p>size: ' + formatSize(file.size) + '</p>',
            '<p>type: ' + file.type + '</p>',
            '<p>last modified date: ' + file.lastModifiedDate.toLocaleDateString() + '</p>'
        ]);

        $mediaBody.append($imageInfo);

        var $imageProcess = $('<div class="image-process progress"></div>');
        $imageProcess.append(['<div class="progress"><div class="progress-bar bg-primary" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div></div>']);
        $mediaBody.append($imageProcess);

        var $imageAction = $('<div class="image-action"></div>');
        $imageAction.append([
            '<button class="btn btn-outline-primary mr-1 action-upload">Upload</button>',
            '<button class="btn btn-danger action-delete">Delete</button>',
        ]);

        $mediaBody.append($imageAction);

        $media.append($mediaBody);


        var reader = new FileReader();
        reader.onload = function (e) {
            $mediaImg
                .attr('src', e.target.result)
                .attr('alt', file.name)
                .height(200);
        };
        reader.readAsDataURL(file);

        return $file
    }

    function exist(file) {
        return files.length && files.some(function (f) {
            return f.id === file.id
        })
    }

    function formatSize(sizeBites) {
        var units = [
            {
                val: 1000,
                text: 'Kb'
            }, {
                val: 1000000,
                text: 'Mb'
            }, {
                val: 1000000000,
                text: 'Gb'
            }
        ];

        var param = units[0];
        units.some(function (unit) {
            if ((sizeBites / unit.val) < 1)
                return true;
            param = unit;
        });

        return [Math.round(sizeBites / (param.val / 10)) / 10, param.text].join(' ')
    }
});

