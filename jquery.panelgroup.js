/*!
* panelGroup 1.0-beta2
* 
* Written by Nathan Shubert-Harbison for Domain7 (www.domain7.com) - #humanizetheweb
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
* 
*/

(function($) {

	var pg = {
		defaults: {
			type: "auto", // options: tabs, accordion, auto (reads data attribute)
			defaultType: 'tabs',
			selectors: {
				item: '.item',
				header: '.item-header',
				content: '.item-content'
			},
			accordionSpeed: 300,
			firstAccordionOpen: true,
			onlyKeepOneOpen: true
		},
		//settings: false,
		typeOptions: ['tab', 'accordion'],
		typeDefault: 'tab',

		init: function(that, options) {

			var settings = $.extend({}, pg.defaults, options );
			$(that).data('panelGroup', settings);

			// Cache the original element. This is for switching to a different group type.
			//NOTE: this approach is going to remove any binding.
			settings.originalHTML = $(that).clone().html();
		
			// Do the proper operation depending on grouping type
			switch ( settings.type ) {
			
				case 'tabs':
					pg.makeTabs($(that));
					break;
			
				case 'accordion':
					pg.makeAccordion($(that));
					break;
				
				case 'auto':
			
					// Get the group type set in the group-type data attribute
					var type = $(that).data('group-type');
				
					// If the type set isn't valid use the default
					if ( pg.typeOptions.indexOf(type) == '-1' ) {
						type = 'tabs';
					}
				
					switch ( type ) {
						case 'tabs':
							pg.makeTabs($(that));
							break;
						case 'accordion':
							pg.makeAccordion($(that));
							break;
						default:
							break;
					}
				
					break;
			
				default:
					break;
			
			} // switch settings.type
			
		}, // init

		makeTabs: function(that) {

			// Create the markup neccesary for tabs
			
				// Header and items containers
			  var settings = $(that).data('panelGroup'),
				    nav = $('<ul class="tab-nav">'),
				    navItems = [],
				    navItemsWidth,
				    items,
				    content = $('<div class="tab-items">');

				that.addClass('tabs');

				// Iterate through each item and build the headers
				that.find(settings.selectors.item).each(function(index) {
			
					// Header
					navItems.push('<li><a href="#" data-tab-index="' + index + '">' + $(this).find(settings.selectors.header).text() + '</a></li>');
					var h = $(this).find(settings.selectors.header).addClass('sr-only').hide();

					// Content
					content.append($(this).find(settings.selectors.content).addClass('item').attr('data-tab-index', index).prepend(h));
					$(this).remove();
			
				});

				// Append header and content items
				nav.append(navItems);
				that.append(nav).append(content);

				// Calculate nav items widths
				nav.find(' > li').css('width', 100 / navItems.length + "%");

				//Add count class
				nav.addClass('has-'+navItems.length);

			// The functionality of tabs

				// Cache items, headers
				items = that.find('.tab-items');

				// Hide all but the first
				items.find('.item').not('[data-tab-index=0]').hide();
				nav.find('a').first().addClass('active');

				// Click handlers
				nav.find('a').on('click focus', function(event) {

					if ( ! $(this).is('.active') ) {

						// Get item to show
						var toShow = $(this).data('tab-index');

						// Show item, hide others
						items.find(settings.selectors.content).not('[data-tab-index=' + toShow + ']').hide();
						items.find(settings.selectors.content+'[data-tab-index=' + toShow + ']').show();

						// Toggle active class
						nav.find('.active').removeClass('active');
						$(this).addClass('active');

					} // ! active

					event.preventDefault();
									
				}); // a.click

		}, // makeTabs

		makeAccordion: function(that) {
			var settings = that.data('panelGroup'),
			    items = that.find(settings.selectors.item),
			    activeItem,
			    animating = false;

			that.addClass('accordion');

			// Check if first accordion item is open or not
			if ( settings.firstAccordionOpen ) {
			
				// Hide items
				that.find(settings.selectors.item + ":gt(0)").find(settings.selectors.content).hide();

				// Active classes
				activeItem = items.first().addClass('active');
			
			} else {
			
				// Hide items
				that.find(settings.selectors.item).find(settings.selectors.content).hide();
			
			}
		

			// The click and toggle situation
			items.find(settings.selectors.header).wrapInner('<a href="#"></a>').children('a').on('click focus', function(event) {

				// Check if an animation is happening right now
				if ( animating ) {

					return false;

				} else {

					var t = $(this),
					    content = t.closest(settings.selectors.item).find(settings.selectors.content),
					    parent = t.closest(settings.selectors.item);

					// Expand or collapse depending on if you clicked an active item or not
					if ( parent.is('.active') ) {
						// Don't close if it is just a focus event
						if( event.type == 'focus' ) {
							return;
						}

						// Close the active item
						animating = true;
						content.slideUp(settings.accordionSpeed, function(){
							parent.removeClass('active');
							animating = false;
						});

					} else {
				
						// Close the items we don't want
						if ( settings.onlyKeepOneOpen ) {
							activeItem = $(this).closest(settings.selectors.item).siblings('.active');
							activeItem.find(settings.selectors.content).slideUp(settings.accordionSpeed, function(){
								activeItem.removeClass('active');
							});
						}
				
						// Open appropriate item
						parent.addClass('active');
						animating = true;
						content.slideDown(settings.accordionSpeed, function(){
							animating = false;
						});

					} // else
			
					event.preventDefault();
				
				} // else if animating

			}); // header.click
		

		}, // makeAccordions

		methods: {
		
			tabsToAccordions: function(that) {
			  var settings = $(that).data('panelGroup');

				// Check if we're dealing with tabs, if so, accordion time!
				if ( $(that).data('groupType') == 'tabs' ) {
				
					// Replace tab markup with original markup
					$(that).html(settings.originalHTML).removeClass('tabs');
				
					// Make into accordion
					pg.makeAccordion($(that));

					// Set whether we've turned tabs into accordions
					$(that).data('tabsToAccordion', 'true');
				
				} // if groupType == tabs

			}, // tabsToAccordions
		
			tabsBackToTabs: function(that) {
			  var settings = $(that).data('panelGroup');

				if ( $(that).data('tabsToAccordion') ) {
				
					// Replace tab markup with original markup
					$(that).html(settings.originalHTML).removeClass('accordion');
				
					// Make into accordion
					pg.makeTabs($(that));

					// Set whether we've turned tabs into accordions
					$(that).data('tabsToAccordion', 'false');
				
				} // if tabsToAccordion
			
			} // tabsBackToTabs
		
		} // methods


	}; // pg

	$.fn.panelGroup = function(options) {

			// Check if we're instantiating plugin with options or calling a method. Normal stuff first.
			if ( !pg.methods[options] ) { 

				// Return main method
				return this.each(function(index) {
				  pg.init(this, options);
				});
			
			} else {

				return this.each(function(index) {
					pg.methods[options].apply(this, Array.prototype.slice.call($(this)));
				});
			}


	}; // panelGroup

}(jQuery));
