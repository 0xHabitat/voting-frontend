import React from "react";
import styled from "styled-components";
import { Flex } from "rimble-ui";

const OptionContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ num = 1 }) => `repeat(${num}, auto)`};
  grid-column-gap: 16px;
  margin-bottom: 16px;
  opacity: ${props => props.disabled ? 0.3 : 1};
`;

const Option = styled(Flex).attrs({
  p: 2,
  borderRadius: 2,
  alignItems: "center",
  justifyContent: "center",
  fontSize: 2,
  color: "voltBrandWhite"
})`
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  border: 3px solid white;
  border-color: ${({ selected = false, optionColor, theme }) =>
    selected ? theme.colors[optionColor] : theme.colors.voltBrandWhite};
  background-color: ${({ selected = false, optionColor, theme }) =>
    selected ? theme.colors[optionColor] : theme.colors.voltBrandMain};
`;

export const Choice = props => {
  const { options, selection, disabled } = props;
  const { onChange } = props;
  return (
    <OptionContainer disabled={disabled} num={options.length}>
      {options.map(option => {
        const { value, color } = option;
        const selected = value === selection;
        return (
          <Option
            key={option.value}
            selected={selected}
            onClick={() => !disabled && onChange(option)}
            optionColor={color}
          >
            {value}
          </Option>
        );
      })}
    </OptionContainer>
  );
};
