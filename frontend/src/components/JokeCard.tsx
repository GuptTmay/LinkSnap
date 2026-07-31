import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type JokeCardProps = {
  title: string
  des: string
  content: string 
}

const JokeCard = (props: JokeCardProps) => {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>{props.title.toUpperCase()}</CardTitle>
        <CardDescription className="text-lg">
          {props.des}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-lg">
        {props.content}
      </CardContent>
    </Card>
  )
}

export default JokeCard