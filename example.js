import {readSync} from 'to-vfile'
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import retextEnglish from 'retext-english'
import retextQuotes from 'retext-quotes'
import retextStringify from 'retext-stringify'

const file = readSync('example.txt')

unified()
  .use(retextEnglish)
  .use(retextQuotes)
  .use(retextStringify)
  .process(file)
  .then((file) => {
    console.error(reporter(file))
  })
