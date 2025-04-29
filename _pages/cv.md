---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}
---

## 🎓 Education

- **Ph.D. in Construction Management**, *National University of Singapore*, 2024  
- **B.Eng. in Civil Engineering**, *Hohai University*, 2017  

---

## 🧑‍🏫 Professional Appointments

- **Research Fellow**, National University of Singapore (Jan 2024 – Present)  
- **Teaching Assistant**, National University of Singapore (Jan 2019 – Jul 2022)  
- **Research Assistant**, Hohai University (Jul 2017 – Dec 2018)  

---

## 🛠 Skills

- **Languages**: Native Chinese, Professional English  
- **Programming**: Python, Matlab  
- **Software**: Rhino/Grasshopper, Revit, Navisworks, AutoCAD  
- **Hardware**: Geophones, DAS (Distributed Acoustic Sensing), Raspberry Pi  

---

## 📚 Selected Publications
<ul>
{% for post in site.publications reversed %}
  <li>
    <a href="{{ base_path }}{{ post.url }}">{{ post.title }}</a><br/>
    {% if post.citation %}
      <small>{{ post.citation | markdownify | strip_html | escape_once }}</small>
    {% endif %}
  </li>
{% endfor %}
</ul>

---

## 🎤 Talks & Presentations
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
---

## 👨‍🏫 Teaching Experience
<ul>
{% for post in site.teaching reversed %}
  <li>
    <a href="{{ base_path }}{{ post.url }}">{{ post.title }}</a>
  </li>
{% endfor %}
</ul>

---

## 🤝 Service & Leadership

- Member, ASCE Technical Council on Computing and IT – VIMS Committee  
- Member, ASCE Technical Council on Computing and IT – DSA Committee  
- (More items coming soon)
