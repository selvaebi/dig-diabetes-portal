package org.broadinstitute.mpg.diabetes.metadata.visitor;

import org.broadinstitute.mpg.diabetes.metadata.DataSet;
import org.broadinstitute.mpg.diabetes.metadata.MetaDataRoot;
import org.broadinstitute.mpg.diabetes.metadata.Property;
import org.broadinstitute.mpg.diabetes.util.PortalConstants;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by mduby on 8/17/15.
 */
public class CommonPropertyVisitor implements DataSetVisitor {
    List<Property> propertyList = new ArrayList<Property>();
    Boolean searchableOnly = new Boolean(Boolean.TRUE);


    /***
     * constructor to allow us to set the searchable switch
     * @param searchableOnly
     */
    public CommonPropertyVisitor(Boolean searchableOnly){this.searchableOnly = searchableOnly;}


    /**
     * only visit the metadata root and return the searchable properties
     *
     * @param dataSet
     */
    public void visit(DataSet dataSet) {
        if (dataSet.getType().equals(PortalConstants.TYPE_METADATA_ROOT_KEY)) {
            MetaDataRoot dataRoot = (MetaDataRoot)dataSet;

            for (Property property : ((MetaDataRoot) dataSet).getProperties()) {
                if (searchableOnly && property.isSearchable()) {
                    this.propertyList.add(property);
                } else {
                    this.propertyList.add(property);
                }
             }
        }
    }

    /**
     * return the resulting properties
     *
     * @return
     */
    public List<Property> getProperties() {
        return this.propertyList;
    }
}
