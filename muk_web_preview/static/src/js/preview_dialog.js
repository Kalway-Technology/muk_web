/**********************************************************************************
* 
*    Copyright (C) 2017 MuK IT GmbH
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU Affero General Public License as
*    published by the Free Software Foundation, either version 3 of the
*    License, or (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU Affero General Public License for more details.
*
*    You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
**********************************************************************************/

odoo.define('muk_preview.PreviewDialog', function (require) {
"use strict";

var core = require('web.core');
var Widget = require('web.Widget');

var PreviewHandler = require('muk_preview.PreviewHandler');
var PreviewGenerator = require('muk_preview.PreviewGenerator');

var QWeb = core.qweb;
var _t = core._t;

var PreviewDialog = Widget.extend({
	init: function(parent, generator, url, mimetype, extension, title) {
        var self = this;
		this._super(parent);
		this.generator = generator;
        this._opened = $.Deferred();
        this.title = title || _t('Preview');
        this.url = url;
        this.mimetype = mimetype;
        this.extension = extension;
		this.$modal = $(QWeb.render('PreviewDialog', {title: this.title, url: this.url}));
        this.$modal.on('hidden.bs.modal', _.bind(this.destroy, this));
        this.$modal.find('.preview-maximize').on('click', _.bind(this.maximize, this));
        this.$modal.find('.preview-minimize').on('click', _.bind(this.minimize, this));
	},
    renderElement: function() {
        this._super();
        var self = this;
        this.generator.createPreview(this.url, this.mimetype, this.extension, this.title).then(function($content) {
            self.setElement($("<div/>").addClass("modal-body preview-body").append($content));
        });
	},
    open: function() {
        var self = this;
        $('.tooltip').remove();
        this.replace(this.$modal.find(".modal-body")).then(function() {
            self.$modal.modal('show');
            self._opened.resolve();
        });
        return self;
    },
    maximize: function(e) {
    	this.$modal.find('.preview-maximize').toggle();
    	this.$modal.find('.preview-minimize').toggle();
    	this.$modal.addClass("modal-fullscreen");
    	
    },
    minimize: function(e) {
    	this.$modal.find('.preview-maximize').toggle();
    	this.$modal.find('.preview-minimize').toggle();
    	this.$modal .removeClass("modal-fullscreen");
    },
    close: function() {
        this.$modal.modal('hide');
    },
    destroy: function(reason) {
        $('.tooltip').remove();
        if(this.isDestroyed()) {
            return;
        }
        this.trigger("closed", reason);
        this._super();
        this.$modal.modal('hide');
        this.$modal.remove();
        setTimeout(function () {
            var modals = $('body > .modal').filter(':visible');
            if(modals.length) {
                modals.last().focus();
                $('body').addClass('modal-open');
            }
        }, 0);
    }
});

PreviewDialog.createPreviewDialog = function (owner, url, mimetype, extension, title) {
    return new PreviewDialog(owner, new PreviewGenerator(), url, mimetype, extension, title).open();
};

return PreviewDialog;

});