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
        },
        find: function(id) {
          var found = {};
          this.each(function(contact, i) {
            if(contact.attr('id') == id) found = contact;
          });
          return found;
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
        // this is the filter that responds to filter url
        // pretty much reads attribute category and gives contacts
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

    Comments = can.Control({
      // it shows comments for a contact
      init: function() {
        // this responds when comments is created
        can.route.attr('contact_id') && this._show(this.options.contacts.find(can.route.attr('contact_id')));
      },
      'comments/:contact_id route': function(data) {
        // should respond to comments route
        this._show(this.options.contacts.find(data.contact_id));
      },
      'route': function(data) {
        // empty root, clear this
        this.element.html('');
      },
      'filter/:category route': function(data) {
        // also clear
        this.element.html('');
      },
      '{Comment} created': function(list, ev, comment) {
        // comment created
        list.push(comment);
        this.show(comment.contact_id);
      },
      '.save click': function(el) {
        // save clicked
        var contact = el.closest('.thiscontact').data('contact');
        contact.attr(can.deparam(this.element.find('form').serialize())).save();
        this._show(contact);
      },
      _show: function(contact) {
        // show the view
        if(contact) {
          this.element.html(can.view('/static/views/commentsView.ejs', {
            contact: contact
          })); 
        }
      }
    });
    
    Create = can.Control({
      // this piece of shit creates new contact
      // it's a fuckin button
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
    // this is a route for filtering contacts according to category
    // basically you got a category and get corresponding contacts, that's it
    can.route('comments/:contact_id')
    // this gives comments for a contact, that's it
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

          new Comments('#comments', {
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