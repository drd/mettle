INTERVAL = 20 * 1000;    // 20 seconds (3600 seconds per hour / 20 = 180 req/hr of 5000)

GHEvents = new Meteor.Collection('ghEvents');

GHEvents.fetchFromServer = function() {
    var user = User.github.username,
        pass = User.github.password;

    if (GHEvents.lastEtag) {
        console.log('Requesting with "If-None-Match": ', GHEvents.lastEtag);
    }

    Meteor.http.get(
        'https://api.github.com/users/' + user + '/events',
        {
            auth: user + ':' + pass,
            headers: GHEvents.lastEtag ?
                { "If-None-Match": GHEvents.lastEtag }
              : { }
        },
        function(error, result) {
            if (result.statusCode == 200) {
                _(result.data).each(function(event) {
                    if (!GHEvents.find({id: event.id}).count()) {
                        GHEvents.insert(event);
                    }
                });
            }

            console.log(result.headers.status,
                        result.headers['x-ratelimit-remaining'],
                        'remaining out of',
                        result.headers['x-ratelimit-limit'],
                        result.headers.etag);

            if (result.headers.etag) {
                GHEvents.lastEtag = result.headers.etag;
                console.log('Setting new etag', GHEvents.lastEtag);
            }
        }
    );
};

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
        console.log('mettle is booting up...');
        // code to run on server at startup
        Meteor.setInterval(GHEvents.fetchFromServer, INTERVAL);
    });
}