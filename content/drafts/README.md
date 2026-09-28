# Chapter drafts

Source text for chapter study material that has been written but not yet converted into
`content/chapters/<class>/<subject>/<chapter>.json`.

Format (one block per chapter):

```
== class/subject/chapter-slug
I: intro          K: key point
E: example problem   S: step   A: answer
P: practice question  H: hint  R: answer
```

Text written as `English || हिंदी` becomes `{ "en": ..., "hi": ... }`; text without `||` stays a plain string.
After conversion these files can be deleted.
