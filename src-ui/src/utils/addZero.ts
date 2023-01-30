const addZero: (num: string, target: number) => string = (num, target) => {
  const filteredNum = `${parseInt(num)}`;
  let prefix = "";
  for(let i = 0; i < target - filteredNum.length; i++) {
    prefix += "0";
  }
  return prefix + filteredNum;
};
export default addZero;