<?php

return [

    'show_warnings' => false,

    'public_path' => null,

    'convert_entities' => true,

    'options' => [
        'font_dir' => storage_path('fonts'),
        'font_cache' => storage_path('fonts'),
        'temp_dir' => sys_get_temp_dir(),
        'chroot' => realpath(base_path()),
        'allowed_protocols' => [
            'data://' => ['rules' => []],
            'file://' => ['rules' => []],
            'http://' => ['rules' => []],
            'https://' => ['rules' => []],
        ],
        'artifactPathValidation' => null,
        'log_output_file' => null,
        'enable_font_subsetting' => false,
        'pdf_backend' => 'CPDF',
        'default_media_type' => 'screen',
        'default_paper_size' => 'a4',
        'default_paper_orientation' => 'portrait',
        'default_font' => 'arial',
        'dpi' => 96,
        'enable_php' => false,
        'enable_javascript' => true,
        'isHtml5ParserEnabled' => true,
        'isRemoteEnabled' => true,
        'isFontSubsettingEnabled' => false,
        'debugPng' => false,
        'debugKeepTemp' => false,
        'debugCss' => false,
        'debugLayout' => false,
        'debugLayoutLines' => false,
        'debugLayoutBlocks' => false,
        'debugLayoutInline' => false,
        'debugLayoutPaddingBox' => false,
        'enable_css_float' => true,
        'enable_css_defer' => false,
        'keep_line_breaks' => true,
        'adminPassword' => null,
    ],
];
