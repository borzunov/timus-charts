Changelog
=========

v1.5
----

Support http://timus.online and http://acm-judge.urfu.ru domains.

v1.4
----

Show copyright during loading, fix minor issues.

v1.3
----

New features:

- Highlighting problems accepted in recent two months

Changes:

- The chart place now appears immediately, without waiting until the browser has finished page loading
- Removed all animation

v1.2
----

Fix bug with months on the chart.

v1.1
----

Changes:

- Removed additional problems map coloring. If you liked this colors, you can install Stylish extension and Timus Red Alert theme: https://userstyles.org/styles/70444/timus-red-alert
- Small cosmetic changes
- Added autoupdate for Greasemonkey

Fixes:

- Workaround for Timus API exception that occurs when an author has submits of deleted problems in a private contest
- Fixed bug with accounts with large number of submits in some versions of Firefox
- Improved error handling


v1.0
----

New features:

- You can add lines for more than two users to the chart, remove them and customize their colors. A small legend with counts of solved problems can be opened.
-  Loading of the chart observably sped up due to using API and caching data. If your have visited the current profile before, only a few count of last submits will be queried. If count of solved problems isn't changed after previous visit, no queries will be executed at all.
- Added animation during chart loading (now the chart appearance doesn't break page scrolling).
- You can hide the chart (it won't appear right after page loading anymore) or show it again by clicking on a link.

Changes:

- Less provoking colors in the solved problems map
- No shadows on the chart

Fixed bugs:

- Deranged colors on the chart during profiles comparison
- Clumsy charts in accounts with small count of solved problems
- Unconsidered problems from competitions that were added to the main archive
