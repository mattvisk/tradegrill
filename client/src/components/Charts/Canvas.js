import { useRef, useEffect } from 'react'

const useCanvas = draw => {  
  const canvasRef = useRef(null)
  useEffect(() => {
    // Get Canvas Context
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    draw(context)    
    return () => {
      // unmount
    }
  }, [draw])  
  return canvasRef
}

const Canvas = props => {  
  const { draw, ...rest } = props
  const canvasRef = useCanvas(draw)
  return <canvas ref={canvasRef} height={props.chartHeight} width={props.chartWidth} {...rest}/>
}

export default Canvas