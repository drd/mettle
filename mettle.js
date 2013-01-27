GHEvents = new Meteor.Collection('ghEvents');

if (Meteor.is_client) {
    Template.events.ghEvents = function() {
        return GHEvents.find({}, {sort: [['created_at', 'desc']]}).fetch();
    };

    Template.event.moment = function(date) {
        return moment(date).fromNow();
    };
}

if (Meteor.is_server) {
    Meteor.startup(function () {
        GHEvents.remove({});
        // code to run on server at startup
        Meteor.setInterval(function() {
            Meteor.http.get(
                'https://api.github.com/users/drd/events',
                function(error, result) {
                    if (result.statusCode == 200) {
                        _(result.data).each(function(event) {
                            if (!GHEvents.find({id: event.id}).count()) {
                                GHEvents.insert(event);
                            }
                        });
                    }
                }
            );
        }, 10000);
    });
}