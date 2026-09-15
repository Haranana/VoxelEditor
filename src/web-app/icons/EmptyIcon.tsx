import React from 'react'
import type { SVGProps } from 'react'

export function EmptyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" 
    width="1em" 
    height="1em" 
    viewBox="0 0 24 24" 
    {...props}>{/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
</svg>
  )
}
export default EmptyIcon