/* globals Pikaday */

import Ember from 'ember';
import moment from 'moment';

const { isPresent, computed } = Ember;

export default Ember.Component.extend({
  tagName: 'input',
  attributeBindings: ['readonly', 'disabled', 'placeholder', 'type', 'name', 'size', 'required'],
  type: 'text',
  valueFormat: 'date',

  internalValue: computed('value', {
    get() {
      let value = this.get('value');
      let valueFormat = this.get('valueFormat');
      if (Object.prototype.toString.call(value) === '[object Date]') {
        return value;
      } else {
        return moment(value, valueFormat).toDate();
      }
    },
    set(key, value) {
      let valueFormat = this.get('valueFormat');
      if (valueFormat === 'date') {
       this.set('value', value);
      } else {
       this.set('value', moment(value).format(valueFormat));
      }
      return value;
    }
  }),

  keyPress: function (e) {
    // hide on enter
    if (e.which === 13) {
        this.get('pikaday').hide();
    }
  },


  firstRender: true,

  setupPikaday: Ember.on('didRender', function() {
    if (this.get('firstRender')) {
      var that = this;
      var firstDay = this.get('firstDay');

      var options = {
        field: this.$()[0],
        onOpen: Ember.run.bind(this, this.onPikadayOpen),
        onClose: Ember.run.bind(this, this.onPikadayClose),
        onSelect: Ember.run.bind(this, this.onPikadaySelect),
        onDraw: Ember.run.bind(this, this.onPikadayRedraw),
        firstDay: (typeof firstDay !== 'undefined') ? parseInt(firstDay, 10) : 1,
        format: this.get('format') || 'DD.MM.YYYY',
        yearRange: that.determineYearRange(),
        minDate: this.get('minDate') || null,
        maxDate: this.get('maxDate') || null,
        theme: this.get('theme') || null
      };
      if (isPresent(this.get('position'))) {
        options['position'] = this.get('position');
      }
      if (isPresent(this.get('reposition'))) {
        options['reposition'] = this.get('reposition');
      }

      if (this.get('i18n')) {
        options.i18n = this.get('i18n');
      }

      var pikaday = new Pikaday(options);

      this.set('pikaday', pikaday);
      this.setPikadayDate();

      this.addObserver('internalValue', function() {
        that.setPikadayDate();
      });

      this.addObserver('minDate', function() {
        this.setMinDate();
      });

      this.addObserver('maxDate', function() {
        this.setMaxDate();
      });
      this.set('firstRender', false);
    }
  }),

  teardownPikaday: Ember.on('willDestroyElement', function() {
    this.get('pikaday').destroy();
  }),

  setPikadayDate: function() {
    this.get('pikaday').setDate(this.get('internalValue'), true);
  },

  setMinDate: function() {
    this.get('pikaday').setMinDate(this.get('minDate'));
  },

  setMaxDate: function() {
    this.get('pikaday').setMaxDate(this.get('maxDate'));
  },

  onPikadayOpen: Ember.K,

  onPikadayClose: function() {
    if (this.get('pikaday').getDate() === null || Ember.isEmpty(this.$().val())) {
      this.set('internalValue', null);
    }
  },

  onPikadaySelect: function() {
    this.userSelectedDate();
  },

  onPikadayRedraw: Ember.K,

  userSelectedDate: function() {
    var selectedDate = this.get('pikaday').getDate();

    if (this.get('useUTC')) {
      selectedDate = moment.utc([selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()]).toDate();
    }

    this.set('internalValue', selectedDate);
  },

  determineYearRange: function() {
    var yearRange = this.get('yearRange');

    if (yearRange) {
      if (yearRange.indexOf(',') > -1) {
        var yearArray = yearRange.split(',');

        if (yearArray[1] === 'currentYear') {
          yearArray[1] = new Date().getFullYear();
        }

        return yearArray;
      } else {
        return yearRange;
      }
    } else {
      return 10;
    }
  },

  autoHideOnDisabled: Ember.observer('disabled', 'pikaday', function () {
    if (this.get('disabled') && this.get('pikaday')) {
      this.get('pikaday').hide();
    }
  })
});
