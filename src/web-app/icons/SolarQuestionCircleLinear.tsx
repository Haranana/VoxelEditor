import React from 'react'
import type { SVGProps } from 'react'

export function SolarQuestionCircleLinear(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}<g fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M10.125 8.875a1.875 1.875 0 1 1 2.828 1.615c-.475.281-.953.708-.953 1.26V13" /><circle cx="12" cy="16" r="1" fill="currentColor" /></g></svg>
  )
}
export default SolarQuestionCircleLinear