mettle
======

a tiny life-streaming thingy in meteor


documentation
=============

mettle looks in /lib for a file called user.js which should define
a User object, containing a github auth object which has your github
username and password as keys. eg:

User = {
  github: {
    username: 'leet-socks',
    password: 'laundry'
  }
};


changes
=======

- added ETags/conditional requests to be nicer to GitHub & your rate limits
- added external auth (hello, github!)
- added README