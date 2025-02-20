export const parseTime = (dateString : string) => {
  let newDate = dateString.replace('T', ' ').replace('.000000Z','');
  return newDate;
}