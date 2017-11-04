var map;
// new array markers
var markers = [];
var locations = [{
        title: 'King Saud University',
        location: {
            lat: 24.716272,
            lng: 46.619110
        }
    },
    {
        title: 'King Abdulaziz Historical Center',
        location: {
            lat: 24.648265,
            lng: 46.710777
        }
    },
    {
        title: 'Imam Muhammad ibn Saud Islamic University',
        location: {
            lat: 24.813048,
            lng: 46.701035
        }
    },
    {
        title: 'King Khalid International Airport',
        location: {
            lat: 24.959915,
            lng: 46.702881
        }
    },
    {
        title: 'Al Hilal Club',
        location: {
            lat: 24.605684,
            lng: 46.624560
        }
    },
];

function initMap() {
    // Constructor creates a new map and center and zoom are required and create array of markers on the map 
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 24.681562,
            lng: 46.696873
        },
        zoom: 10,
    });
    //The following group uses the location to create a array of markers at initialization
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker for each location,  set in markes array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to array markers.
        locations[i].marker = marker;
        markers.push(marker);
        bounds.extend(marker.position);
        marker.addListener('click', addListener);

    }


}


populateInfoWindow = function(marker, infowindow) {
    //wikipedia AJAX request
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';

    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        jsonp: "callback",
        success: function(response) {
            var articleList = response[1];
            for (var i = 0; i < articleList.length; i++) {
                var articeSet = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articeSet;
                infowindow.setContent('<h4>' + marker.title + '</h4><p>' + '</p><a href=\"' + url + '\"> click here For more information </a>');
            }
            infowindow.marker = marker;
            infowindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);

        }
    }).fail(function() {
        alert("Error failed to generate API");
    });
};

function viewModel() {
    var self = this;
    self.locations = ko.observableArray(locations);
    self.query = ko.observable('');
    self.title = ko.observable();
    self.marker = ko.observable();

    self.testLocations = ko.computed(function() {
        var filter = self.query().toLowerCase();
        if (!filter) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setVisible(true);

            }
            return this.locations();
        } else {

            return ko.utils.arrayFilter(self.locations(), function(locations) {
                for (var i = 0; i < markers.length; i++) {
                    locations.marker.setVisible(locations.title.toLowerCase().indexOf(filter) != -1);
                }
                return locations.title.toLowerCase().indexOf(filter) != -1;

            });

        }
    }, self);
    //click on infoWindow
    this.infoWindow = function(loc) {
        google.maps.event.trigger(loc.marker, 'click');
    };
}

//click on list to show marker
function addListener() {
    populateInfoWindow(this, largeInfowindow);
    bounceTimer(this, marker);
}

function bounceTimer(marker) {
    setTimeout(function() {
        marker.setAnimation(null);
    }, 1000);
}

function onError() {
    alert("Error! Google Map has failed to load and try again.");
}

ko.applyBindings(new viewModel());
