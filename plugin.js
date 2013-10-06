/*
 * @file Background plugin for CKEditor
 * Copyright (C) 2011-13 Alfonso Martínez de Lizarrondo
 *
 * == BEGIN LICENSE ==
 *
 * Licensed under the terms of any of the following licenses at your
 * choice:
 *
 *  - GNU General Public License Version 2 or later (the "GPL")
 *    http://www.gnu.org/licenses/gpl.html
 *
 *  - GNU Lesser General Public License Version 2.1 or later (the "LGPL")
 *    http://www.gnu.org/licenses/lgpl.html
 *
 *  - Mozilla Public License Version 1.1 or later (the "MPL")
 *    http://www.mozilla.org/MPL/MPL-1.1.html
 *
 * == END LICENSE ==
 *
 */
(function() {
"use strict";

// A placeholder just to notify that the plugin has been loaded
CKEDITOR.plugins.add( 'backgrounds',
{
	// Translations, available at the end of this file, without extra requests
//	lang : [ 'en', 'es' ],

	init : function( editor )
	{
		// v 4.1 filters
		if (editor.addFeature)
		{
			editor.addFeature( {
				name : 'background image',
				allowedContent: {
					'table td th': {
						propertiesOnly: true,
                        attributes: 'background',
                        styles: 'background-repeat,background-position'
					}
				}
			} );
		}

		// It doesn't add commands, buttons or dialogs, it doesn't do anything here
	} //Init
} );


// This is the real code of the plugin
CKEDITOR.on( 'dialogDefinition', function( ev )
	{
		// Take the dialog name and its definition from the event data.
		var dialogName = ev.data.name,
			dialogDefinition = ev.data.definition,
			editor = ev.editor,
			tabName = '';

		// Check if it's one of the dialogs that we want to modify and note the proper tab name.
		if ( dialogName == 'table' || dialogName == 'tableProperties' )
			tabName = 'advanced';

		if ( dialogName == 'cellProperties' )
		{
			tabName = 'info';
			dialogDefinition.minHeight += 80;
		}

		// Not one of the managed dialogs.
		if ( tabName == '' )
			return;

		// Get a reference to the tab.
		var tab = dialogDefinition.getContents( tabName ),
			lang = editor.lang.backgrounds;

		if (!tab)
			return;

		// The text field
		var textInput =  {
				type : 'text',
				label : lang.label,
				id : 'background',
				setup : function( selectedElement )
				{
					this.setValue( selectedElement.getAttribute( 'background' ) );
				},
				commit : function( data, selectedElement )
				{
					var element = selectedElement || data,
						value = this.getValue();
					if ( value )
						element.setAttribute( 'background', value );
					else
						element.removeAttribute( 'background' );
				}
			};

		// File browser button
		var browseButton =  {
				type : 'button',
				id : 'browse',
				hidden : 'true',
				filebrowser :
				{
					action : 'Browse',
					target: tabName + ':background',
					url: editor.config.filebrowserImageBrowseUrl || editor.config.filebrowserBrowseUrl
				},
				label : editor.lang.common.browseServer,
				requiredContent : textInput.requiredContent
			};

		// The position field
		var backgroundPosition = {
			type: 'select',
			label: lang.position,
			id: 'backgroundPosition',
			items:
			[
				[lang.left_top,'left top'],
				[lang.left_center,'left center'],
				[lang.left_bottom,'left bottom'],
				[lang.center_top,'center top'],
				[lang.center_center,'center center'],
				[lang.center_bottom,'center bottom'],
				[lang.right_top,'right top'],
				[lang.right_center,'right center'],
				[lang.right_bottom,'right bottom']
			],
			setup: function (selectedElement) {
				this.setValue( selectedElement.getStyle('background-position') );
			},
			onChange: function() {
				var stylesInput = this.getDialog().getContentElement('advanced', 'advStyles');

				if (stylesInput) {
					stylesInput.updateStyle('background-position', this.getValue());
				}
			},
			commit: function (data, selectedElement) {
				var element = selectedElement || data,
					value = this.getValue(),
					oBackground = this.getDialog().getContentElement(tabName, "background"),
					background = oBackground && oBackground.getValue();

				if (value && background)
					element.setStyle('background-position', value);
				else
					element.removeStyle('background-position'); // it doesn't really work for the table
			}
		};

		// The repeat select field
		var backgroundRepeat = {
			type: 'select',
			label: lang.repeat,
			id: 'backgroundRepeat',
			items:
			[
				[ lang.repeatBoth, '' ],
				[ lang.repeatX, 'repeat-x' ],
				[ lang.repeatY, 'repeat-y' ],
				[ lang.repeatNone, 'no-repeat' ]
			],
			setup: function (selectedElement) {
				this.setValue( selectedElement.getStyle('background-repeat') );
			},
			onChange: function() {
				var stylesInput = this.getDialog().getContentElement('advanced', 'advStyles');

				if (stylesInput) {
					stylesInput.updateStyle('background-repeat', this.getValue());
				}
			},
			commit: function (data, selectedElement) {
				var element = selectedElement || data,
					value = this.getValue(),
					oBackground = this.getDialog().getContentElement(tabName, "background"),
					background = oBackground && oBackground.getValue();

				if (value && background)
					element.setStyle('background-repeat', value);
				else
					element.removeStyle('background-repeat'); // it doesn't really work for the table
			}
		};

		// Enabled/disabled automatically in 4.1 by ACF
		if ( dialogName == 'cellProperties' )
		{
			textInput.requiredContent = 'td[background];th[background]';
			backgroundPosition.requiredContent = 'td[background];th[background]';
			backgroundRepeat.requiredContent = 'td[background];th[background]';
		}
		else
		{
			textInput.requiredContent = 'table[background]';
			backgroundPosition.requiredContent = 'table[background]';
			backgroundRepeat.requiredContent = 'table[background]';
		}

		// Add the elements to the dialog
		if (tabName == 'advanced')
		{
			// Two rows
			tab.add(textInput);
			tab.add(browseButton);
			tab.add({
				type: 'hbox',
				widths: ['', '100px'],
				children: [backgroundPosition, backgroundRepeat ]
			});
		}
		else
		{
			// In the cell dialog add it as a single row
			browseButton.style = 'display:inline-block;margin-top:10px;';
			tab.add({
					type : 'hbox',
					widths: [ '', '100px'],
					children : [ textInput, browseButton],
					requiredContent : textInput.requiredContent
			});
			tab.add({
				type: 'hbox',
				widths: ['', '100px'],
				children: [backgroundPosition, backgroundRepeat]
			});
		}

	// inject this listener before the one from the fileBrowser plugin so there are no problems with the new fields.
	}, null, null, 9 );


// Translations
	var textsEn = {
		label	: 'Background image',
		position : 'Background position',
		repeat: 'Background repeat',
		repeatBoth : 'Repeat',
		repeatX : 'Horizontally',
		repeatY : 'Verticaly',
		repeatNone : 'None',
		left_top : 'Left Top',
		left_center :'Left Center',
		left_bottom : 'Left Bottom',
		center_top : 'Center Top',
		center_center : 'Center Center',
		center_bottom :'Center Bottom',
		right_top : 'Right Top',
		right_center :' Right Center',
		right_bottom : 'Right Bottom'

	};
	var textsEs = {
		label	: 'Imagen de fondo',
		position : 'Posición del fondo',
		repeat: 'Repetición del fondo',
		repeatBoth : 'Repetir',
		repeatX : 'Horizontalmente',
		repeatY : 'Verticalmente',
		repeatNone : 'Ninguno',
		left_top : 'Izquierda arriba',
		left_center :'Izquierda centro',
		left_bottom : 'Izquierda abajo',
		center_top : 'Centro arriba',
		center_center : 'Centro centro',
		center_bottom :'Centro abajo',
		right_top : 'Derecha arriba',
		right_center :' Derecha centro',
		right_bottom : 'Derecha abajo'
	};

	if (CKEDITOR.skins)
	{
		// V3
		CKEDITOR.plugins.setLang( 'backgrounds', 'en', { backgrounds : textsEn } );
		CKEDITOR.plugins.setLang( 'backgrounds', 'es', { backgrounds : textsEs } );
	}
	else
	{
		// V4
		CKEDITOR.plugins.setLang( 'backgrounds', 'en',	textsEn );
		CKEDITOR.plugins.setLang( 'backgrounds', 'es',	textsEs );
	}
})();
