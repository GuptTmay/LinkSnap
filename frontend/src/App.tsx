import { useEffect, useState } from "react"
import { Input } from "./components/ui/input"
import JokeCard from "./components/JokeCard";

type CardProps = {
  type: string
  setup: string
  punchline: string
  id: number
}

function App() {
  const [cardData, setCardData] = useState([]);
  const [cnt, setCnt] = useState(0); 

  const getData = async (cnt: number) => {
    const response = await fetch('https://official-joke-api.appspot.com/jokes/random/' + cnt);
    const data = await response.json();
    setCardData(data);
  }

  useEffect(() => {
    getData(cnt);
  }, [cnt])

  return (
    <div className="w-screen mx-auto p-5">
      <h1 className="text-2xl my-10 font-bold">Jokes</h1>
      <div className="flex py-5">
        <Input type="number" placeholder="Enter Number..." onChange={(e) => setCnt(Number(e.target.value))} />
      </div>

      <div className="flex justify-center items-center">
        <div className="w-10/12 grid grid-cols-1 lg:grid-cols-4 gap-2">
          {
            cardData.map((card: CardProps) => <JokeCard key={card.id} title={card.type} des={card.setup} content={card.punchline} />)
          }
        </div>
      </div>

    </div>
  )
}

export default App