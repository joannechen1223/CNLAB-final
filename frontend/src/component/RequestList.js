import React from 'react';

export default ({ id, student, identity, click, state, website}) => {
	var name = "btn btn-lg";
	if (state === "downgrade") name = name + " btn-outline-success";
	else if (state === "upgrade") name = name + " btn-outline-danger";
          return (
               <tr id={id}>
                    <th scope="row">{id + 1}</th>
                    <td>{student}</td>
                    <td className={state}>{identity}</td>
                    <td>{website}</td>
                    <td className="grade"><input type="button" className={name} onClick={click} value="allow"/></td>
               </tr>
          )
}
