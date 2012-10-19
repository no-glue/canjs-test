(function(){
    
    Contact = can.Model({
      findAll: 'GET /contacts',
      create  : "POST /contacts",
      update  : "PUT /contact/{id}",
      destroy : "DELETE /contact/{id}"
    },{});

    Category = can.Model({
      findAll: 'GET /categories'
    },{});
    
    Contact.List = can.Model.List({
        filter: function(category){
            this.attr('length');
            var contacts = new Contact.List([]);
            this.each(function(contact, i){
                if(category === 'all' || category === contact.attr('category')){
                    contacts.push(contact);
                }
            });
            return contacts
        },
        count: function(category){
            return this.filter(category).length;
        }
    });
    
    Contacts = can.Control({
      init: function(){
        this.element.html(can.view('/static/views/contactsList.ejs', {
          contacts: this.options.contacts,
          categories: this.options.categories
        }));
      },
      '.contact input focusout': function(el, ev){
          this.updateContact(el);
      },
      '.contact input keyup': function(el, ev){
          if(ev.keyCode == 13){
              el.trigger('blur')
          }
      },
      '.contact select change': function(el, ev){
          this.updateContact(el)
      },
      updateContact: function(el){
          var contact = el.closest('.contact').data('contact');
          contact.attr(el.attr('name'), el.val()).save();
      },
      '.remove click': function(el, ev){
          el.closest('.contact').data('contact').destroy();
      },
      '{Contact} created': function(list, ev, contact){
          this.options.contacts.push(contact);
      }
    });
    
    Filter = can.Control({
        init: function(){
            var category = can.route.attr('category') || "all";
            this.element.html(can.view('/static/views/filterView', {
                contacts: this.options.contacts,
                categories: this.options.categories
            }));
            this.element.find('[data-category="' + category + '"]').parent().addClass('active');
        },
        '[data-category] click': function(el, ev){
            this.element.find('[data-category]').parent().removeClass('active');
            el.parent().addClass('active');
            can.route.attr('category', el.data('category'));
        }
    });
    
    Create = can.Control({
        show: function(){
            this.contact = new Contact();
            this.element.html(can.view('/static/views/createView.ejs', {
                contact: this.contact,
                categories: this.options.categories
            }));
            this.element.slideDown(200);
        },
        hide: function(){
            this.element.slideUp(200);
        },
        '{document} #new-contact click': function(){
            this.show();
        },
        '.contact input keyup': function(el, ev){
            if(ev.keyCode == 13){
                this.createContact(el);
            }
        },
        '.save click': function(el){
            this.createContact(el);
        },
        '.cancel click': function(){
            this.hide();
        },
        createContact: function(){
            var form = this.element.find('form');
            var values = can.deparam(form.serialize());
            if(values.name !== ""){
                this.contact.attr(values).save();
                this.hide();
            }
        }
    })
    
    can.route( 'filter/:category' )
    can.route('', {category: 'all' })
    
    $(document).ready(function(){
      $.when(Category.findAll(), Contact.findAll()).then(
        function(categoryResponse, contactResponse){
          var categories = categoryResponse[0], 
            contacts = contactResponse[0];

          new Contacts('#contacts', {
            contacts: contacts,
            categories: categories
          });
          
          new Filter('#filter', {
              contacts: contacts,
              categories: categories
          });
          
          new Create('#create', {
              contacts: contacts,
              categories: categories
          });
      });
    });
    
})();