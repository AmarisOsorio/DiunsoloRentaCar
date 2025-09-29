import React, { memo } from 'react';
import VehicleCard from './VehicleCard';

const MemoizedVehicleCard = memo(({ item, index, onPress }) => {
    return (
        <VehicleCard 
            item={item} 
            index={index} 
            onPress={onPress}
        />
    );
}, (prevProps, nextProps) => {
    return prevProps.item._id === nextProps.item._id &&
           prevProps.item.status === nextProps.item.status;
});

export default MemoizedVehicleCard;
