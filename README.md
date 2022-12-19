# Linkinfo 2 HTML

Take linkinfo formatted input, output as HTML

## Arguments

```shell
-t --title : string
```
Provide a value to use as the HTML page title.

## Example

linkinfo is formatted like so:
```plaintext
https://en.wikipedia.org/wiki/Speech_recognition
Speech recognition
I found this was a useful overview for understanding what speech recognition is.

https://en.wikipedia.org/wiki/Text_to_speech
Text to speech
Great resource on the history of text to speech

https://en.wikipedia.org/wiki/AI-complete
AI Complete
This is something I plan to read soon!


```
This is "line separated values", where each row is separated by two newlines, and each column in a row is separated by a single new line.

If the above data is stored in a file `example.linkinfo`, and we want to save the output HTML into a file named `index.html`, we might execute the following command:
```shell
cat example.linkinfo | deno run --allow-read mod.ts > index.html
```

## Usage hints

- Use with [text2links](https://github.com/javascriptxbest/text2links) 