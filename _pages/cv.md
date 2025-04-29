---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

# Education
- **Ph.D. in Construction Management**, National University of Singapore, 2024
- **B.Eng. in Civil Engineering**, Hohai University, 2017

# Professional Appointments
- **Research Fellow**, National University of Singapore (Jan 2024 – Present)
- **Teaching Assistant**, National University of Singapore (Jan 2019 – Jul 2022)
- **Research Assistant**, Hohai University (Jul 2017 – Dec 2018)

# Skills
- **Language Proficiency**: Native Chinese, Professional English
- **Programming**: Python, Matlab
- **Software/Tools**: Rhino/Grasshopper, Revit, Naviswork, AutoCAD
- **Hardware**: Geophones, Distributed Acoustic Sensing (DAS) System, Raspberry Pi

# Publications
<ul>
{% for post in site.publications reversed %}
  <li>
    <a href="{{ base_path }}{{ post.url }}">{{ post.title }}</a><br/>
    {% if post.citation %}<small>{{ post.citation }}</small>{% endif %}
  </li>
{% endfor %}
</ul>

# Talks
<ul>
{% for post in site.talks reversed %}
  <li>
    <a href="{{ base_path }}{{ post.url }}">{{ post.title }}</a><br/>
    {% if post.venue %}
      <small>{{ post.type }} at {{ post.venue }}, {{ post.location }}</small>
    {% endif %}
  </li>
{% endfor %}
</ul>

# Teaching
<ul>
{% for post in site.teaching reversed %}
  <li>
    <a href="{{ base_path }}{{ post.url }}">{{ post.title }}</a>
  </li>
{% endfor %}
</ul>

# Service and Leadership
- Currently signed in to 43 different Slack teams
