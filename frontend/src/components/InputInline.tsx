import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function InputInline() {
  const [cnt, setCnt] = useState(0); 
  return (
    <Field orientation="horizontal">
      <Input type="number" placeholder="Enter Number..." onChange={(e) => setCnt(Number(e.target.value))} />
      {/* <Button onClick={}>Submit</Button> */}
    </Field>
  )
}
