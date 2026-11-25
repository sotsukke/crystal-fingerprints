import summary from './summary.md?raw'
import { Markdown } from './markdown'

export function Journal() {
  return (
    <article className="course journal">
      <h1>AI journal</h1>
      <Markdown src={summary} />
    </article>
  )
}
